import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOutputEntryDto {
  @IsMongoId()
  millId: string;

  @IsIn(['private', 'government'])
  partyType: 'private' | 'government';

  @IsString()
  @IsNotEmpty()
  partyName: string;

  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  riceType?: string;

  @IsString()
  @IsOptional()
  bagsCount?: string;

  @IsNumber()
  @IsOptional()
  weightKg?: number;

  @IsNumber()
  @IsOptional()
  ratePerKg?: number;

  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @IsString()
  @IsOptional()
  linkedIntakeLot?: string;
}
