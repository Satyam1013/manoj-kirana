import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type OutputEntryDocument = OutputEntry & Document;

@Schema({ timestamps: true })
export class OutputEntry {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Mill', required: true })
  millId: Types.ObjectId;

  @Prop({ required: true, enum: ['private', 'government'] })
  partyType: 'private' | 'government';

  @Prop({ required: true, trim: true })
  partyName: string;

  @Prop({ required: true })
  date: string;

  @Prop()
  riceType?: string;

  @Prop()
  bagsCount?: string;

  @Prop()
  weightKg?: number;

  @Prop()
  ratePerKg?: number;

  @Prop()
  vehicleNumber?: string;

  @Prop()
  linkedIntakeLot?: string; // references an intake lot number for traceability, not a hard foreign key
}

export const OutputEntrySchema = SchemaFactory.createForClass(OutputEntry);
