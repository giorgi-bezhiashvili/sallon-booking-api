import {
  IsDateString,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RequestBookingDto {
  @IsMongoId()
  staffId!: string;

  // ISO 8601, e.g. "2026-08-25T14:00:00.000Z"
  @IsDateString()
  startTime!: string;

  @IsInt()
  @Min(5)
  @Max(60)
  durationMinutes!: number;

  @IsPhoneNumber()
  customerPhone!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerName?: string;
}
