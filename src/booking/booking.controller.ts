import { Body, Controller, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { RequestBookingDto } from './dto/request-booking.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Step 1: hold a slot (checks availability) and text the customer an OTP.
  @Post('request')
  requestSlot(@Body() dto: RequestBookingDto) {
    return this.bookingService.requestSlot(dto);
  }

  // Step 2: confirm the held slot by verifying the OTP.
  @Post('verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.bookingService.verifyOtp(dto);
  }
}
