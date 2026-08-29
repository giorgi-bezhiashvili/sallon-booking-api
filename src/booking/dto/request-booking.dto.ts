import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Service, Sex } from '../../schemas/booking.schema';
export class RequestBookingDto {
  @IsMongoId()
  staffId!: string;

  @IsEnum(Service)
  service!: Service;

  // ISO 8601, e.g. "2026-08-25T14:00:00.000Z"
  @IsDateString()
  startTime!: string;

  @IsInt()
  @Min(5)
  @Max(60)
  durationMinutes!: number;

  @IsPhoneNumber('GE')
  customerPhone!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerName?: string;

  @IsEnum(Sex)
  sex!: Sex;
}
