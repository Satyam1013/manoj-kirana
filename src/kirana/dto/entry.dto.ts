import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateEntryDto {
  // Provide either an existing customerId, or a customerName to find-or-create
  // (mirrors the frontend's openEntryModal behaviour).
  @ValidateIf((o) => !o.customerName)
  @IsMongoId()
  customerId?: string;

  @ValidateIf((o) => !o.customerId)
  @IsString()
  @IsNotEmpty()
  customerName?: string;

  @IsString()
  @IsOptional()
  village?: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsNumber()
  @Min(0)
  qty: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsIn(['debit', 'credit'])
  type: 'debit' | 'credit';

  // If true, auto-generate a Bill (debit) or Receipt (credit) for this entry.
  @IsOptional()
  generateDoc?: boolean;

  @IsString()
  @IsOptional()
  phone?: string;
}
