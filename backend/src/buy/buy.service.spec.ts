import { Test, TestingModule } from '@nestjs/testing';
import { BuyService } from './buy.service';
import { MysqlService } from '../mysql/mysql.service';
import { DepositService } from '../deposit/deposit.service';
import { UserService } from '../user/user.service';

describe('BuyService - getSellerStats', () => {
  let buyService: BuyService;

  const mockMysqlService = {
    query: jest.fn(),
  };

  const mockDepositService = {};
  const mockUserService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuyService,
        { provide: MysqlService, useValue: mockMysqlService },
        { provide: DepositService, useValue: mockDepositService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    buyService = module.get<BuyService>(BuyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct sales stats including totalProducts', async () => {
    const sellerId = 1;

    // Mock stats result - Make sure numbers are returned (not strings)
    mockMysqlService.query
      .mockResolvedValueOnce([
        {
          totalTransactions: 5,
          totalUnitsSold: 100,
          totalRevenue: 2500,
        },
      ])
      .mockResolvedValueOnce([
        {
          totalProducts: 4,
        },
      ]);

    const result = await buyService.getSellerStats(sellerId);

    expect(result).toEqual({
      totalTransactions: 5,
      totalUnitsSold: 100,
      totalRevenue: 2500,
      totalProducts: 4,
    });

    expect(mockMysqlService.query).toHaveBeenCalledTimes(2);
    expect(mockMysqlService.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM sales'),
      [sellerId],
    );
    expect(mockMysqlService.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM products'),
      [sellerId],
    );
  });
});
