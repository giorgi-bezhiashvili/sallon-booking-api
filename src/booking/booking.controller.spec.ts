import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from '../schemas/booking.schema';
import { Staff } from '../schemas/staff.schema';
import { SmsService } from '../sms/sms.service';
import { MailService } from '../mail/mail.service';

describe('BookingController', () => {
  let controller: BookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        BookingService,
        { provide: getModelToken(Booking.name), useValue: {} },
        { provide: getModelToken(Staff.name), useValue: {} },
        { provide: SmsService, useValue: { sendOtp: jest.fn() } },
        { provide: MailService, useValue: {} },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
