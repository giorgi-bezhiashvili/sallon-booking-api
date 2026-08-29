import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

export enum BookingStatus {
  // Slot is provisionally held while the customer enters the OTP.
  PENDING_OTP = 'pending_otp',
  CONFIRMED = 'confirmed',
  // OTP window ran out, or too many wrong attempts — slot is free again.
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}
export enum Sex {
  MALE = 'male',
  FEMALE = 'female',
}
export enum Service {
  HAIRCUT = 'თმის შეჭრა',
  HAIRWASH = 'თმის დაბანა',
}
@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Staff', required: true, index: true })
  staff!: Types.ObjectId;

  @Prop({ required: true })
  customerPhone!: string;

  @Prop()
  customerName?: string;

  @Prop({ required: true })
  startTime!: Date;

  @Prop({ required: true })
  endTime!: Date;

  @Prop({
    type: String,
    enum: BookingStatus,
    default: BookingStatus.PENDING_OTP,
  })
  status!: BookingStatus;

  // Only set while status === PENDING_OTP. Cleared on confirm.
  @Prop()
  otpCode?: string;

  @Prop()
  otpExpiresAt?: Date;

  @Prop({ default: 0 })
  otpAttempts!: number;

  @Prop({ required: true })
  service!: string;

  @Prop({ required: true, enum: Sex, type: String })
  sex!: Sex;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Speeds up the overlap query (staff + time range) done on every request.
BookingSchema.index({ staff: 1, startTime: 1, endTime: 1 });
