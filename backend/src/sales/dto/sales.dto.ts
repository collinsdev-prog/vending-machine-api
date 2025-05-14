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
  productId: number; // Assuming you are referencing the product ID in the sale

  @IsNumber()
  @Min(1)
  quantity: number; // Quantity of the product sold

  @IsNumber()
  @Min(0)
  totalPrice: number; // Total price for the sale, could be product price * quantity

  @IsString()
  @IsOptional()
  description?: string; // Optional description for the sale (e.g., special discount, etc.)
}
