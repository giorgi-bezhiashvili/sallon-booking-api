import { Body, Controller, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { RequestBookingDto } from './dto/request-booking.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // Step 1: hold a slot (checks availability) and text the customer an OTP.
  @Throttle({ default: { limit: 3, ttl: 60_000 } }) // 3/min
  @Post('request')
  requestSlot(@Body() dto: RequestBookingDto) {
    return this.bookingService.requestSlot(dto);
  }

  // Step 2: confirm the held slot by verifying the OTP.
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // 3/min
  @Post('verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.bookingService.verifyOtp(dto);
  }
}
