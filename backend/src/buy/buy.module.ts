import { Module } from '@nestjs/common';
import { BuyService } from './buy.service';
import { MysqlService } from '../mysql/mysql.service';
import { DepositService } from '../deposit/deposit.service';
import { UserService } from '../user/user.service';
import { BuyController } from './buy.controller';

@Module({
  imports: [],
  controllers: [BuyController],
  providers: [BuyService, MysqlService, DepositService, UserService],
})
export class BuyModule {}
