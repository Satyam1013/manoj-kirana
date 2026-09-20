import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BillItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0.01)
  qty: number;

  @IsNumber()
  @Min(0)
  rate: number;
}

export class CreateBillDto {
  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  items: BillItemDto[];

  // When true (default), also posts a debit ledger entry for the customer
  // and deducts sold quantities from inventory — mirrors the frontend checkbox.
  @IsBoolean()
  @IsOptional()
  autoLedger?: boolean;
}
