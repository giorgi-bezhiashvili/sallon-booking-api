import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { Booking } from '../schemas/booking.schema';
import { Staff } from '../schemas/staff.schema';
import { SmsService } from '../sms/sms.service';

describe('BookingService', () => {
  let service: BookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: getModelToken(Booking.name), useValue: {} },
        { provide: getModelToken(Staff.name), useValue: {} },
        { provide: SmsService, useValue: { sendOtp: jest.fn() } },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
