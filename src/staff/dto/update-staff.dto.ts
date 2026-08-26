import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffDto } from './create-staff.dto';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Transform(({ value }) => {
    if (Array.isArray(value)) return value as unknown;
    if (typeof value === 'string')
      return value.split(',').map((item) => item.trim());
    return value as unknown;
  })
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  roles!: string[];

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
