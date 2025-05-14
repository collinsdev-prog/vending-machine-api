import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MysqlService } from '../mysql/mysql.service';
import { DepositService } from '../deposit/deposit.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: MysqlService,
          useValue: {
            query: jest.fn(),
            execute: jest.fn(),
          },
        },
        {
          provide: DepositService,
          useValue: {
            getDepositByUserId: jest.fn(),
            updateDeposit: jest.fn(),
            // Add any other methods you call in UserService
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
