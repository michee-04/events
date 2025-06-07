import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

@Schema({
  collection: 'minio_files',
  timestamps: true,
})
export class MinioFile extends Document {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  downloadUrl: string;

  @Prop({ type: String, required: true })
  originalName: string;

  @Prop({ type: String, required: true })
  fileName: string;

  @Prop({ type: Number, required: true })
  size: number;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: false })
  fileId: mongoose.Schema.Types.ObjectId | string;

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

export const MinioFileSchema = SchemaFactory.createForClass(MinioFile);

export type MinioFileDocument = HydratedDocument<MinioFile>;
