import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { Staff, StaffSchema } from '../schemas/staff.schema';
import { SmsModule } from '../sms/sms.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
    SmsModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]), // 20 req/min default
  ],
  controllers: [BookingController],
  providers: [BookingService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class BookingModule {}
