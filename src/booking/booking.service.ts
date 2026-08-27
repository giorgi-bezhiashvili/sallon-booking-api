import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../schemas/booking.schema';
import { Staff, StaffDocument } from '../schemas/staff.schema';
import { RequestBookingDto } from './dto/request-booking.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SmsService } from '../sms/sms.service';
import { MailService } from '../mail/mail.service'; // Import MailService
import { hashOtp, otpMatches } from './otp.util';

const OTP_TTL_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const MAX_BOOKING_DURATION_MINUTES = 60;
const MAX_BOOKING_WINDOW_DAYS = 7;
@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Staff.name) private staffModel: Model<StaffDocument>,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
  ) {}

  async requestSlot(dto: RequestBookingDto) {
    if (dto.durationMinutes > MAX_BOOKING_DURATION_MINUTES) {
      throw new BadRequestException(
        `Bookings can be at most ${MAX_BOOKING_DURATION_MINUTES} minutes`,
      );
    }

    if (!Types.ObjectId.isValid(dto.staffId)) {
      throw new BadRequestException('Invalid staff id');
    }

    const staff = await this.staffModel.findById(dto.staffId);
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    const startTime = new Date(dto.startTime);
    if (Number.isNaN(startTime.getTime())) {
      throw new BadRequestException('Invalid startTime');
    }
    if (startTime.getTime() < Date.now()) {
      throw new BadRequestException('startTime must be in the future');
    }

    const maxAllowedStart =
      Date.now() + MAX_BOOKING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    if (startTime.getTime() > maxAllowedStart) {
      throw new BadRequestException(
        `Bookings can only be made up to ${MAX_BOOKING_WINDOW_DAYS} days in advance`,
      );
    }

    const endTime = new Date(
      startTime.getTime() + dto.durationMinutes * 60_000,
    );

    // Free up any of this staff's holds whose OTP window already lapsed,
    // so a customer who never verified doesn't permanently block the slot.
    await this.expireStaleHolds(dto.staffId);

    const overlapping = await this.bookingModel.findOne({
      staff: dto.staffId,
      status: { $in: [BookingStatus.PENDING_OTP, BookingStatus.CONFIRMED] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (overlapping) {
      throw new ConflictException(
        'This employee already has a booking that overlaps that time',
      );
    }

    const otpCode = this.generateOtp();

    let booking: BookingDocument;
    try {
      booking = await this.bookingModel.create({
        staff: dto.staffId,
        customerPhone: dto.customerPhone,
        customerName: dto.customerName,
        startTime,
        endTime,
        status: BookingStatus.PENDING_OTP,
        otpCode: hashOtp(otpCode),
        otpExpiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000),
        otpAttempts: 0,
      });
    } catch (err) {
      if ((err as { code?: number })?.code === 11000) {
        throw new ConflictException(
          'This employee already has a booking that overlaps that time',
        );
      }
      throw err;
    }

    await this.smsService.sendOtp(dto.customerPhone, otpCode);

    return {
      bookingId: booking._id,
      status: booking.status,
      startTime: booking.startTime,
      endTime: booking.endTime,
      otpExpiresAt: booking.otpExpiresAt,
      message: 'OTP sent. Verify within 5 minutes to confirm the booking.',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    if (!Types.ObjectId.isValid(dto.bookingId)) {
      throw new BadRequestException('Invalid booking id');
    }

    // Populate the staff object so we can read staff.email
    const booking = await this.bookingModel
      .findById(dto.bookingId)
      .populate<{ staff: StaffDocument }>('staff');

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking is already confirmed');
    }

    if (booking.status !== BookingStatus.PENDING_OTP) {
      throw new BadRequestException(
        `Booking is ${booking.status} and can no longer be verified`,
      );
    }

    if (!booking.otpExpiresAt || booking.otpExpiresAt.getTime() < Date.now()) {
      booking.status = BookingStatus.EXPIRED;
      booking.otpCode = undefined;
      await booking.save();
      throw new GoneException(
        'OTP has expired — please request the slot again',
      );
    }

    if (booking.otpAttempts >= MAX_OTP_ATTEMPTS) {
      booking.status = BookingStatus.EXPIRED;
      booking.otpCode = undefined;
      await booking.save();
      throw new GoneException(
        'Too many incorrect attempts — please request the slot again',
      );
    }

    if (!booking.otpCode || !otpMatches(dto.otp, booking.otpCode)) {
      booking.otpAttempts += 1;
      await booking.save();
      throw new BadRequestException('Incorrect OTP code');
    }

    // Mark as confirmed
    booking.status = BookingStatus.CONFIRMED;
    booking.otpCode = undefined;
    booking.otpExpiresAt = undefined;
    await booking.save();

    // Send notification email to the staff member
    if (booking.staff && booking.staff.email) {
      await this.mailService.sendBookingNotification(
        booking.staff.email,
        booking.customerPhone,
        booking.customerName,
        booking.startTime,
        booking.endTime,
      );
    }

    return {
      bookingId: booking._id,
      status: booking.status,
      staff: booking.staff._id,
      startTime: booking.startTime,
      endTime: booking.endTime,
    };
  }
  private async expireStaleHolds(staffId: string) {
    await this.bookingModel.updateMany(
      {
        staff: staffId,
        status: BookingStatus.PENDING_OTP,
        otpExpiresAt: { $lt: new Date() },
      },
      { $set: { status: BookingStatus.EXPIRED } },
    );
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
