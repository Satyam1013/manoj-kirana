import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type EntryDocument = Entry & Document;

@Schema({ timestamps: true })
export class Entry {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ required: true })
  date: string; // yyyy-mm-dd, mirrors frontend's plain string dates

  @Prop({ required: true, trim: true })
  itemName: string;

  @Prop({ required: true })
  qty: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ trim: true })
  village: string;

  @Prop({ required: true, enum: ['debit', 'credit'] })
  type: 'debit' | 'credit';

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  docId: Types.ObjectId | null;

  @Prop({ enum: ['bill', 'receipt'], default: null })
  docType: 'bill' | 'receipt' | null;
}

export const EntrySchema = SchemaFactory.createForClass(Entry);
