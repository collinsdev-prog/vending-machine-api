import {
  Controller,
  Post,
  Body,
  Get,
  //   Param,
  BadRequestException,
} from '@nestjs/common';
import { SalesService, SaleStats } from './sales.service';
import { User } from '../user/user.decorator';
import { Roles } from '../auth/roles.decorator';
import { SalesDto } from './dto/sales.dto';
import { UserRole } from '../auth/dto/auth.dto';

@Controller('sales')
export class SalesController {
  constructor(private salesService: SalesService) {}

  @Post('create')
  @Roles(UserRole.SELLER)
  async createSale(@User('id') userId: number, @Body() salesDto: SalesDto) {
    if (!salesDto.productId || !salesDto.quantity || !salesDto.totalPrice) {
      throw new BadRequestException(
        'Product ID, Quantity, and Total Price are required',
      );
    }
    return this.salesService.createSale(userId, salesDto);
  }

  @Get('stats')
  @Roles(UserRole.SELLER)
  async getSalesStats(@User('id') userId: number): Promise<SaleStats> {
    return this.salesService.getSalesStats(userId);
  }

  //   @Get(':saleId')
  //   @Roles(UserRole.SELLER)
  //   async getSaleById(@Param('saleId') saleId: number) {
  //     return this.salesService.getSaleById(saleId);
  //   }
}
