import { IsInt, IsPositive, IsOptional, IsString } from 'class-validator';

export class BuyDto {
  @IsInt()
  @IsPositive()
  productId: number; // The ID of the product being purchased

  @IsInt()
  @IsPositive()
  quantity: number; // The quantity of the product being purchased

  @IsOptional()
  @IsString()
  description?: string; // Optional description of the purchase
}
