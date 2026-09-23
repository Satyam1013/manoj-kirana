import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type IntakeEntryDocument = IntakeEntry & Document;

@Schema({ timestamps: true })
export class IntakeEntry {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Mill', required: true })
  millId: Types.ObjectId;

  @Prop({ required: true, enum: ['private', 'government'] })
  partyType: 'private' | 'government';

  @Prop({ required: true, trim: true })
  partyName: string;

  @Prop({ required: true })
  date: string;

  @Prop()
  time?: string;

  @Prop()
  lotNumber?: string; // or truck receipt no.

  @Prop()
  paddyVariety?: string;

  @Prop()
  bagsCount?: string;

  @Prop()
  weightKg?: number;

  @Prop()
  ratePerKg?: number;

  @Prop()
  vehicleNumber?: string;

  @Prop()
  moistureContent?: number;
}

export const IntakeEntrySchema = SchemaFactory.createForClass(IntakeEntry);
