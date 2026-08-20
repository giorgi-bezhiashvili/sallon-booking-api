import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaffModule } from './staff/staff.module';
import { BookingModule } from './booking/booking.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    StaffModule,
    BookingModule,
    MongooseModule.forRoot('mongodb://localhost:27017/my-nest-db'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
