import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateReceiptDto {
  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}
