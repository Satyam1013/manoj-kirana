import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type RentPaymentDocument = RentPayment & Document;

@Schema({ timestamps: true })
export class RentPayment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Store', required: true })
  storeId: Types.ObjectId;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  amount: number;
}

export const RentPaymentSchema = SchemaFactory.createForClass(RentPayment);
