import { Module } from '@nestjs/common';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { MysqlModule } from '../mysql/mysql.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [MysqlModule, UserModule],
  controllers: [DepositController],
  providers: [DepositService],
  exports: [DepositService],
})
export class DepositModule {}
