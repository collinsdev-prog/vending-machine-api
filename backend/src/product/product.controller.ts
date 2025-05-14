import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/product.dto';
import { Roles } from '../auth/roles.decorator';
import { User } from '../user/user.decorator';
import { UserRole } from '../auth/dto/auth.dto';

// I defined a standard response interface for better response handling
// across the application. This interface can be reused in other controllers as well.
// This is a simple interface to define the structure of the API response
// and can be extended as needed.
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('my-products')
  @Roles(UserRole.SELLER)
  async getMyProducts(
    @User('id') sellerId: number,
  ): Promise<ApiResponse<any[]>> {
    const products = await this.productService.findBySellerId(sellerId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Products retrieved successfully',
      data: products,
    };
  }

  @Get()
  async getAll(): Promise<ApiResponse<any[]>> {
    const products = await this.productService.findAll();
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'All products retrieved successfully',
      data: products,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: number): Promise<ApiResponse<any>> {
    const product = await this.productService.findOne(+id);
    if (!product) throw new NotFoundException('Product not found');
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  @Post()
  @Roles(UserRole.SELLER)
  async create(
    @User('id') sellerId: number,
    @Body() dto: CreateProductDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.productService.create(dto, sellerId);
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: result.message,
    };
  }

  @Put(':id')
  @Roles(UserRole.SELLER)
  async update(
    @Param('id') id: number,
    @User('id') sellerId: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ApiResponse<any>> {
    const result = await this.productService.update(+id, dto, sellerId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }

  @Delete(':id')
  @Roles(UserRole.SELLER)
  async remove(
    @Param('id') id: number,
    @User('id') sellerId: number,
  ): Promise<ApiResponse<any>> {
    const result = await this.productService.delete(+id, sellerId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }
}
