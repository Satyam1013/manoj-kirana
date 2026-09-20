import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInEntryDto {
  @IsMongoId()
  storeId: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsString()
  @IsNotEmpty()
  lotNumber: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @IsNotEmpty()
  materialName: string;

  @IsString()
  @IsOptional()
  sackCount?: string;

  @IsNumber()
  @IsOptional()
  weightKg?: number;

  @IsString()
  @IsOptional()
  lenderEntry?: string;

  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @IsNumber()
  @IsOptional()
  ratePerKg?: number;
}

export class CreateOutEntryDto {
  @IsMongoId()
  storeId: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsNotEmpty()
  outOwnerName: string;

  @IsString()
  @IsOptional()
  lotNumber?: string;
}
