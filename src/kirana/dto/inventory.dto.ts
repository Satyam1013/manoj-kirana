import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  qty?: number;

  @IsNumber()
  @IsOptional()
  price?: number;
}

export class AdjustStockDto {
  @IsIn(['add', 'reduce'])
  mode: 'add' | 'reduce';

  @IsNumber()
  @Min(0.01)
  qty: number;

  @IsNumber()
  @IsOptional()
  price?: number;
}
