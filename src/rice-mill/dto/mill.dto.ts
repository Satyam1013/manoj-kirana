import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMillDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
