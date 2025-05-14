import { IsNumber, IsIn } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @IsIn([5, 10, 20, 50, 100], {
    message: 'Only 5, 10, 20, 50, and 100 cent coins are accepted',
  })
  amount: number;
}
