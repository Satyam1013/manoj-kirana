import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BillDocument = Bill & Document;

@Schema({ _id: false })
class BillItem {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  qty: number;

  @Prop({ required: true })
  rate: number;

  @Prop({ required: true })
  amount: number;
}

@Schema({ timestamps: true })
export class Bill {
  @Prop({ required: true, unique: true })
  billNo: string; // INV-0001 style, sequential

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, trim: true })
  customerName: string;

  @Prop({ trim: true })
  village: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ type: [BillItem], required: true })
  items: BillItem[];

  @Prop({ required: true })
  total: number;

  @Prop({ default: true })
  autoLedger: boolean;
}

export const BillSchema = SchemaFactory.createForClass(Bill);
