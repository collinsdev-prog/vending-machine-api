import { Module } from '@nestjs/common';
import { BuyService } from './buy.service';
import { MysqlService } from '../mysql/mysql.service';
import { DepositService } from '../deposit/deposit.service';
import { UserService } from '../user/user.service';
import { BuyController } from './buy.controller'; // If you are using a controller to handle routes

@Module({
  imports: [], // Add any other modules here if needed (e.g., DatabaseModule, AuthModule, etc.)
  controllers: [BuyController], // Register BuyController if you're using it
  providers: [
    BuyService,
    MysqlService,
    DepositService,
    UserService, // These services are injected into BuyService
  ],
})
export class BuyModule {}
