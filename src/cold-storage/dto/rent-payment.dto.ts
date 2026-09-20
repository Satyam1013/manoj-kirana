import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRentPaymentDto {
  @IsMongoId()
  storeId: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
