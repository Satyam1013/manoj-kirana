import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ColdEntryDocument = ColdEntry & Document;

@Schema({ timestamps: true })
export class ColdEntry {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Store', required: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, enum: ['in', 'out'] })
  mode: 'in' | 'out';

  @Prop({ required: true })
  date: string;

  // ----- IN fields -----
  @Prop()
  time?: string;

  @Prop()
  lotNumber?: string;

  @Prop()
  ownerName?: string; // owner who deposited the goods (IN)

  @Prop()
  materialName?: string;

  @Prop()
  sackCount?: string;

  @Prop()
  weightKg?: number;

  @Prop()
  lenderEntry?: string;

  @Prop()
  vehicleNumber?: string;

  @Prop()
  ratePerKg?: number;

  // ----- OUT fields -----
  @Prop()
  outOwnerName?: string; // person who took the goods out (OUT)
}

export const ColdEntrySchema = SchemaFactory.createForClass(ColdEntry);
