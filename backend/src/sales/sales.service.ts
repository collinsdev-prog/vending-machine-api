import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { MysqlService } from '../mysql/mysql.service';
import { UserService } from '../user/user.service';
import { SalesDto } from './dto/sales.dto'; // DTO to validate incoming sale data

export interface SaleStats {
  totalProducts: number;
  totalProductsSold: number;
  totalRevenue: number;
}

@Injectable()
export class SalesService {
  constructor(
    private mysql: MysqlService,
    private userService: UserService,
  ) {}

  /**
   * Create a sale record for the seller
   */
  async createSale(
    userId: number,
    salesDto: SalesDto,
  ): Promise<{ message: string }> {
    const { productId, quantity, totalPrice, description } = salesDto;

    // Check if the user is a seller
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can create sales');
    }

    // Ensure valid product ID and quantity (you can expand with more checks here)
    if (!productId || quantity <= 0 || totalPrice <= 0) {
      throw new BadRequestException(
        'Invalid product ID, quantity or total price',
      );
    }

    // Insert the sale record into the database
    const query = `
        INSERT INTO sales (user_id, product_id, quantity, total_price, description, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
    await this.mysql.execute(query, [
      userId,
      productId,
      quantity,
      totalPrice,
      description || '',
    ]);

    return { message: 'Sale recorded successfully' };
  }

  /**
   * Get statistics for the seller: total sales, revenue, etc.
   */
  async getSalesStats(userId: number): Promise<SaleStats> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'seller')
      throw new ForbiddenException('Only sellers can view sales stats');

    const query = `
      SELECT
        (SELECT COUNT(*) FROM products WHERE sellerId = ?) AS totalProducts,
        (SELECT COALESCE(SUM(quantity), 0) FROM sales WHERE seller_id = ?) AS totalProductsSold,
        (SELECT COALESCE(SUM(total_price), 0) FROM sales WHERE seller_id = ?) AS totalRevenue
    `;

    type RawSaleStatsRow = {
      totalProducts: number;
      totalProductsSold: number;
      totalRevenue: number;
    };

    const [rows] = await this.mysql.execute<RawSaleStatsRow>(query, [
      userId,
      userId,
      userId,
    ]);

    const row = rows[0] as RawSaleStatsRow | undefined;

    return {
      totalProducts: row?.totalProducts ?? 0,
      totalProductsSold: row?.totalProductsSold ?? 0,
      totalRevenue: row?.totalRevenue ?? 0,
    };
  }
}
