import {
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';

export class SalesDto {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number; // Quantity of the product sold

  @IsNumber()
  @Min(0)
  totalPrice: number; // Total price for the sale, could be product price * quantity

  @IsString()
  @IsOptional()
  description?: string; // Optional description for the sale
}
