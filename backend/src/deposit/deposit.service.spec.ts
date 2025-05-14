import { Test, TestingModule } from '@nestjs/testing';
import { DepositService } from './deposit.service';
import { MysqlService } from '../mysql/mysql.service';
import { UserService } from '../user/user.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('DepositService', () => {
  let depositService: DepositService;

  // Define mocks before using them
  const mockUserService = {
    findById: jest.fn(),
  };

  const mockMysqlService = {
    execute: jest.fn(query => {
      // Mock behavior based on query type
      if (query === 'UPDATE users SET deposit = ? WHERE id = ?') {
        return Promise.resolve({ affectedRows: 1 });
      }
      return Promise.reject(new Error('Unknown query'));
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositService,
        { provide: MysqlService, useValue: mockMysqlService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    depositService = module.get<DepositService>(DepositService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deposit', () => {
    it('should throw BadRequestException for invalid coin denomination', async () => {
      await expect(depositService.deposit(1, 3)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);
      await expect(depositService.deposit(1, 50)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a buyer', async () => {
      mockUserService.findById.mockResolvedValue({ role: 'admin' });
      await expect(depositService.deposit(1, 50)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should deposit funds correctly for a valid buyer', async () => {
      const user = { id: 1, role: 'buyer', deposit: 100 };
      mockUserService.findById.mockResolvedValue(user);
      mockMysqlService.execute.mockResolvedValue({ affectedRows: 1 });

      const result = await depositService.deposit(1, 50);

      expect(result.message).toBe('Successfully deposited 50 cents');
      expect(result.currentDeposit).toBe(150);
      expect(mockMysqlService.execute).toHaveBeenCalledWith(
        'UPDATE users SET deposit = ? WHERE id = ?',
        [150, 1],
      );
    });
  });

  describe('resetDeposit', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);
      await expect(depositService.resetDeposit(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a buyer', async () => {
      mockUserService.findById.mockResolvedValue({ role: 'admin' });
      await expect(depositService.resetDeposit(1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should reset deposit to 0 for a valid buyer', async () => {
      const user = { id: 1, role: 'buyer', deposit: 100 };
      mockUserService.findById.mockResolvedValue(user);
      mockMysqlService.execute.mockResolvedValue({ affectedRows: 1 });

      const result = await depositService.resetDeposit(1);

      expect(result.message).toBe('Deposit reset to 0');
      expect(mockMysqlService.execute).toHaveBeenCalledWith(
        'UPDATE users SET deposit = 0 WHERE id = ?',
        [1],
      );
    });
  });

  describe('calculateChange', () => {
    it('should calculate the correct change for a given amount', () => {
      const result = depositService.calculateChange(135);
      expect(result).toEqual([100, 20, 10, 5]);
    });

    it('should return empty array when no change is needed', () => {
      const result = depositService.calculateChange(0);
      expect(result).toEqual([]);
    });
  });

  describe('processPurchase', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);
      await expect(depositService.processPurchase(1, 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a buyer', async () => {
      mockUserService.findById.mockResolvedValue({ role: 'admin' });
      await expect(depositService.processPurchase(1, 100)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if insufficient funds', async () => {
      const user = { id: 1, role: 'buyer', deposit: 50 };
      mockUserService.findById.mockResolvedValue(user);
      await expect(depositService.processPurchase(1, 100)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should process the purchase and return change', async () => {
      const user = { id: 1, role: 'buyer', deposit: 200 };
      mockUserService.findById.mockResolvedValue(user);
      mockMysqlService.execute.mockResolvedValue({ affectedRows: 1 });

      const result = await depositService.processPurchase(1, 150);

      expect(result.success).toBe(true);
      expect(result.change).toEqual([50]);
      expect(result.newDeposit).toBe(0);
      expect(mockMysqlService.execute).toHaveBeenCalledWith(
        'UPDATE users SET deposit = 0 WHERE id = ?',
        [1],
      );
    });
  });
});
