import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryItemDocument = InventoryItem & Document;

@Schema({ timestamps: true })
export class InventoryItem {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: 'unit', trim: true })
  unit: string;

  @Prop({ default: 0 })
  qty: number;

  @Prop({ default: 0 })
  price: number;
}

export const InventoryItemSchema = SchemaFactory.createForClass(InventoryItem);
