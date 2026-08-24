import { IsMongoId, IsNumberString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsMongoId()
  bookingId!: string;

  @IsNumberString()
  @Length(6, 6)
  otp!: string;
}
