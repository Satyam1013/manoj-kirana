import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MillDocument = Mill & Document;

@Schema({ timestamps: true })
export class Mill {
  @Prop({ required: true, trim: true })
  name: string;
}

export const MillSchema = SchemaFactory.createForClass(Mill);
