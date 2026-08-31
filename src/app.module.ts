import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StaffModule } from './staff/staff.module';
import { BookingModule } from './booking/booking.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    StaffModule,
    BookingModule,
    MongooseModule.forRoot('mongodb://localhost:27017/sallon-booking-api'),
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes process.env / ConfigService available everywhere
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
