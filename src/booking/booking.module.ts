import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { Staff, StaffSchema } from '../schemas/staff.schema';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Staff.name, schema: StaffSchema },
    ]),
    SmsModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
