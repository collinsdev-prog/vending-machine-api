import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { User } from '../user/user.decorator';
import { Roles } from '../auth/roles.decorator';
import { DepositDto } from './dto/deposit.dto';
import { UserRole } from '../auth/dto/auth.dto';

@Controller('user')
export class DepositController {
  constructor(private depositService: DepositService) {}

  @Post('deposit')
  @Roles(UserRole.BUYER) // only buyer can deposit
  async deposit(@User('id') userId: number, @Body() depositDto: DepositDto) {
    if (!depositDto.amount) {
      throw new BadRequestException('Amount is required');
    }
    return this.depositService.deposit(userId, depositDto.amount);
  }

  @Post('reset')
  @Roles(UserRole.BUYER) // only buyer can reset
  async resetDeposit(@User('id') userId: number) {
    return this.depositService.resetDeposit(userId);
  }
}
