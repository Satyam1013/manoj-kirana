import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReceiptDocument = Receipt & Document;

@Schema({ timestamps: true })
export class Receipt {
  @Prop({ required: true, unique: true })
  receiptNo: string; // RCPT-0001 style, sequential

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ trim: true })
  village: string;

  @Prop({ required: true })
  amount: number;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
