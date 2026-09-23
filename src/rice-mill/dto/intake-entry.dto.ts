import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateIntakeEntryDto {
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
  time?: string;

  @IsString()
  @IsOptional()
  lotNumber?: string;

  @IsString()
  @IsOptional()
  paddyVariety?: string;

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

  @IsNumber()
  @IsOptional()
  moistureContent?: number;
}
