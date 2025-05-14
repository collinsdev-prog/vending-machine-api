import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MysqlService } from '../mysql/mysql.service';
import { UserService } from '../user/user.service';

// Valid coin denominations in cents
const VALID_COINS = [5, 10, 20, 50, 100];

@Injectable()
export class DepositService {
  constructor(
    private mysql: MysqlService,
    private userService: UserService,
  ) {}

  /**
   * Add funds to a user's deposit account
   * Only buyers can deposit money and only valid coin denominations are accepted
   */
  async deposit(
    userId: number,
    amount: number,
  ): Promise<{ message: string; currentDeposit: number }> {
    // Validate the coin denomination
    if (!VALID_COINS.includes(amount)) {
      throw new BadRequestException(
        `Invalid coin denomination. Only ${VALID_COINS.join(', ')} cent coins are accepted.`,
      );
    }

    // Get the user to check their role
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only buyers can deposit
    if (user.role !== 'buyer') {
      throw new ForbiddenException('Only buyers can deposit funds');
    }

    // Update the user's deposit
    const currentDeposit = (user.deposit || 0) + amount;
    await this.mysql.execute('UPDATE users SET deposit = ? WHERE id = ?', [
      currentDeposit,
      userId,
    ]);

    return {
      message: `Successfully deposited ${amount} cents`,
      currentDeposit,
    };
  }

  /**
   * Reset a user's deposit to zero
   * Only applicable for buyers
   */
  async resetDeposit(userId: number): Promise<{ message: string }> {
    // Get the user to check their role
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only buyers can reset deposits
    if (user.role !== 'buyer') {
      throw new ForbiddenException('Only buyers can reset their deposit');
    }

    // Reset the deposit to 0
    await this.mysql.execute('UPDATE users SET deposit = 0 WHERE id = ?', [
      userId,
    ]);

    return {
      message: 'Deposit reset to 0',
    };
  }

  /**
   * Calculate change to return in the required coin denominations
   * @param amount Total amount to return as change (in cents)
   * @returns Array of coins representing the change
   */
  calculateChange(amount: number): number[] {
    const change: number[] = [];
    let remaining = amount;

    // Sort coins in descending order to use the largest coins first
    const sortedCoins = [...VALID_COINS].sort((a, b) => b - a);

    for (const coin of sortedCoins) {
      while (remaining >= coin) {
        change.push(coin);
        remaining -= coin;
      }
    }

    return change;
  }

  /**
   * Process a purchase and calculate change
   * This would typically be called from a BuyService or similar
   */
  async processPurchase(
    userId: number,
    totalCost: number,
  ): Promise<{
    success: boolean;
    change?: number[];
    newDeposit: number;
  }> {
    // Get the user to check their role and deposit
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only buyers can make purchases
    if (user.role !== 'buyer') {
      throw new ForbiddenException('Only buyers can make purchases');
    }

    const currentDeposit = user.deposit || 0;

    // Check if user has enough funds
    if (currentDeposit < totalCost) {
      throw new ForbiddenException('Insufficient funds');
    }

    // Calculate the remaining deposit after purchase
    const remainingDeposit = currentDeposit - totalCost;

    // Calculate change in required denominations
    const change = this.calculateChange(remainingDeposit);

    // Update the user's deposit to 0 after purchase (all change is returned)
    await this.mysql.execute('UPDATE users SET deposit = 0 WHERE id = ?', [
      userId,
    ]);

    return {
      success: true,
      change,
      newDeposit: 0,
    };
  }
}
