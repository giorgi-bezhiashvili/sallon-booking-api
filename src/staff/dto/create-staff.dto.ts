import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  roles!: string[];
}
