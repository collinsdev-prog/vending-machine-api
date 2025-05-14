import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RowDataPacket } from 'mysql2';
import { MysqlService } from '../mysql/mysql.service';
import { DepositService } from '../deposit/deposit.service';
import { UserService } from '../user/user.service';
import { BuyDto } from './dto/buy.dto';
import { Product, PurchaseResult, PurchaseHistoryRow } from './buy.types';

@Injectable()
export class BuyService {
  constructor(
    private mysql: MysqlService,
    private depositService: DepositService,
    private userService: UserService,
  ) {}

  /**
   * Find a product by its ID
   */
  async findProductById(productId: number): Promise<Product | null> {
    // Type the result as RowDataPacket[] to ensure TypeScript knows the structure
    const rows = await this.mysql.query<RowDataPacket[]>(
      'SELECT id, productName, cost, amountAvailable, sellerId FROM products WHERE id = ? LIMIT 1',
      [productId],
    );

    // Check if any rows were returned
    if (!rows.length) {
      return null;
    }

    // Type cast the row and ensure all properties exist
    const row = rows[0];

    // Create a new object with explicit property checks
    const product: Product = {
      id: Number(row.id),
      productName: String(row.productName),
      cost: Number(row.cost),
      amountAvailable: Number(row.amountAvailable),
      sellerId: Number(row.sellerId),
    };

    return product;
  }

  /**
   * Buy products with the deposited money
   */
  async buy(userId: number, buyDto: BuyDto): Promise<PurchaseResult> {
    const { productId, quantity } = buyDto;

    // Validate input
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    // Get the user to check role and deposit
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only buyers can make purchases
    if (user.role !== 'buyer') {
      throw new ForbiddenException('Only buyers can make purchases');
    }

    const currentDeposit = user.deposit || 0;

    // Get the product
    const product = await this.findProductById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if there's enough of the product available
    if (product.amountAvailable < quantity) {
      throw new BadRequestException('Not enough product available');
    }

    // Calculate total cost
    const totalCost = product.cost * quantity;

    // Check if user has enough funds
    if (currentDeposit < totalCost) {
      throw new ForbiddenException(
        'Insufficient funds, make a deposit again to purchase',
      );
    }

    // Process the purchase and get change
    const purchaseResult = await this.depositService.processPurchase(
      userId,
      totalCost,
    );

    // Update product amount
    await this.mysql.execute(
      'UPDATE products SET amountAvailable = amountAvailable - ? WHERE id = ?',
      [quantity, productId],
    );

    // record the sale (for product owner/seller)
    await this.mysql.execute(
      'INSERT INTO sales (buyer_id, seller_id, product_id, quantity, total_price, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, product.sellerId, productId, quantity, totalCost],
    );

    return {
      depositedAmount: currentDeposit,
      totalSpent: totalCost,
      products: [
        {
          productId: product.id,
          productName: product.productName,
          amount: quantity,
          cost: product.cost,
        },
      ],
      change: purchaseResult.change || [],
      note: 'Remaining deposit has been returned as change. Please deposit again before your next purchase.',
    };
  }

  /**
   * Get sales stats for a specific seller
   */
  async getSellerStats(sellerId: number) {
    const [stats] = await this.mysql.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) AS totalTransactions,
        IFNULL(SUM(quantity), 0) AS totalUnitsSold,
        IFNULL(SUM(total_price), 0) AS totalRevenue
      FROM sales
      WHERE seller_id = ?`,
      [sellerId],
    );

    const [productStats] = await this.mysql.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalProducts
         FROM products
         WHERE sellerId = ?`,
      [sellerId],
    );

    return {
      totalTransactions: Number(stats.totalTransactions),
      totalUnitsSold: Number(stats.totalUnitsSold),
      totalRevenue: Number(stats.totalRevenue),
      totalProducts: Number(productStats.totalProducts),
    };
  }

  /**
   * Get purchase history for a specific buyer
   */
  async getPurchaseHistory(buyerId: number) {
    const rows = await this.mysql.query<PurchaseHistoryRow[]>(
      `SELECT 
          s.id AS saleId,
          s.product_id AS productId,
          p.productName,
          s.quantity,
          s.total_price AS totalPrice,
          s.created_at AS date
        FROM sales s
        JOIN products p ON s.product_id = p.id
        WHERE s.buyer_id = ?
        ORDER BY s.created_at DESC`,
      [buyerId],
    );

    return rows.map(row => ({
      saleId: row.saleId,
      productId: row.productId,
      productName: row.productName,
      quantity: row.quantity,
      totalPrice: row.totalPrice,
      date: row.date,
    }));
  }
}
