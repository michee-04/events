import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

@Schema({
  collection: 'tokens',
  timestamps: true,
})
export class Token extends Document {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  userId: mongoose.Schema.Types.ObjectId | string;

  @Prop({ type: String, required: true, index: true })
  accessToken: string;

  @Prop({ type: String, required: true, index: true })
  refreshToken: string;

  @Prop({ type: String, required: true })
  ipAddress: string;

  @Prop({ type: String })
  appType?: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

export type TokenDocument = HydratedDocument<Token>;
