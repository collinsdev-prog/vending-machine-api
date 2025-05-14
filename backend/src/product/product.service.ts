import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MysqlService } from '../mysql/mysql.service';
import { UserService } from '../user/user.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    private mysql: MysqlService,
    private userService: UserService,
  ) {}

  /**
   * Get all products (public)
   */
  async findAll() {
    return this.mysql.query('SELECT * FROM products WHERE isDeleted = FALSE');
  }
  /**
   * Get a specific product by ID (public)
   */
  async findOne(id: number) {
    const rows = await this.mysql.query(
      'SELECT * FROM products WHERE id = ? AND isDeleted = FALSE',
      [id],
    );
    if (rows.length === 0) throw new NotFoundException('Product not found');
    return rows[0];
  }

  /**
   * Get all products by seller ID (seller-only, owner only for update/delete)
   * @param sellerId
   * @returns
   * @throws NotFoundException if the seller does not exist
   * @throws ForbiddenException if the user is not a seller
   * @throws ForbiddenException if the user is not the owner of the product
   * @throws NotFoundException if the product does not exist
   * @throws ForbiddenException if the user is not authorized to view the product
   * @throws ForbiddenException if the user is not authorized to update the product
   * @throws ForbiddenException if the user is not authorized to delete the product
   * @throws ForbiddenException if the user is not authorized to view all products by seller ID
   * @throws ForbiddenException if the user is not authorized to view a specific product by seller ID
   * @throws ForbiddenException if the user is not authorized to update a specific product by seller ID
   */
  async findBySellerId(sellerId: number) {
    const user = await this.userService.findById(sellerId);
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can view their own products');
    }

    return this.mysql.query(
      'SELECT * FROM products WHERE sellerId = ? AND isDeleted = FALSE',
      [sellerId],
    );
  }

  /**
   * Create a new product (seller-only)
   */
  async create(
    dto: CreateProductDto,
    sellerId: number,
  ): Promise<{ message: string }> {
    const user = await this.userService.findById(sellerId);
    if (!user) throw new NotFoundException('Seller not found');
    if (user.role !== 'seller')
      throw new ForbiddenException('Only sellers can create products');

    const { productName, amountAvailable, cost } = dto;

    await this.mysql.execute(
      `INSERT INTO products (productName, amountAvailable, cost, sellerId)
         VALUES (?, ?, ?, ?)`,
      [productName, amountAvailable, cost, sellerId],
    );

    return { message: 'Product created successfully' };
  }

  /**
   * Update an existing product (seller-only, only owner)
   */
  async update(
    id: number,
    dto: UpdateProductDto,
    sellerId: number,
  ): Promise<{ message: string }> {
    const product = await this.findOne(id);
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException(
        'You are not authorized to update this product',
      );
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (dto.productName) {
      fields.push('productName = ?');
      values.push(dto.productName);
    }

    if (dto.amountAvailable !== undefined) {
      fields.push('amountAvailable = ?');
      values.push(dto.amountAvailable);
    }

    if (dto.cost !== undefined) {
      fields.push('cost = ?');
      values.push(dto.cost);
    }

    if (fields.length === 0) return { message: 'No fields to update' };

    values.push(id);

    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    await this.mysql.execute(sql, values);

    return { message: 'Product updated successfully' };
  }

  /**
   * Delete a product (seller-only, only owner)
   */
  async delete(id: number, sellerId: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException(
        'You are not authorized to delete this product',
      );
    }

    await this.mysql.execute(
      'UPDATE products SET isDeleted = TRUE WHERE id = ?',
      [id],
    );

    return { message: 'Product deleted successfully' };
  }
}
