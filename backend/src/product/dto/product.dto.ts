import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  productName: string;

  @IsInt()
  @Min(1, { message: 'Amount available must be at least 1' })
  amountAvailable: number;

  @IsInt()
  @Min(1, { message: 'Cost must be at least 1 cent' })
  cost: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Amount available must be at least 1' })
  amountAvailable?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Cost must be at least 1 cent' })
  cost?: number;
}
