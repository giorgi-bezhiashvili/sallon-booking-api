import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StaffDocument = HydratedDocument<Staff>;

@Schema({ timestamps: true })
export class Staff {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: [String], required: true })
  roles!: string[];

  @Prop({ type: [String], default: [] })
  photos!: string[];
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
