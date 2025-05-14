import { Controller, Post, Get, Body } from '@nestjs/common';
import { BuyService } from './buy.service';
import { User } from '../user/user.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';
import { BuyDto } from './dto/buy.dto';
import { PurchaseResult } from './buy.types';

@Controller('user')
export class BuyController {
  constructor(private buyService: BuyService) {}

  @Post('buy')
  @Roles(UserRole.BUYER)
  async buy(
    @User('id') userId: number,
    @Body() buyDto: BuyDto,
  ): Promise<PurchaseResult> {
    return this.buyService.buy(userId, buyDto);
  }

  @Get('my-sales-stats')
  @Roles(UserRole.SELLER)
  async getMySalesStats(@User('id') sellerId: number) {
    return this.buyService.getSellerStats(sellerId);
  }

  @Get('my-purchase-history')
  @Roles(UserRole.BUYER)
  async getMyPurchaseHistory(@User('id') userId: number) {
    return this.buyService.getPurchaseHistory(userId);
  }
}
