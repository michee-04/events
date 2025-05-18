import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, HydratedDocument } from 'mongoose';

@Schema({
  collection: 'core_journals',
  timestamps: true,
})
export class Journal extends Document {
  @ApiProperty({ type: String, example: '66c39ca0de267891d423a9e8' })
  _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty({
    type: String,
    enum: ['info', 'warn', 'error'],
    example: 'error',
  })
  @Prop({ type: String, required: true })
  level: string;

  @ApiProperty({ type: String, example: 'An error has occured.' })
  @Prop({ type: String, required: true })
  message: string;

  @ApiProperty({ example: {}, default: {} })
  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  data: Record<string, any> = {};

  @ApiProperty({ type: Boolean, example: true, default: true })
  @Prop({ type: Boolean, default: true })
  active: boolean;

  @ApiProperty({ type: Boolean, example: false, default: false })
  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @ApiProperty({ type: Date, example: null, required: false, nullable: true })
  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @ApiProperty({ type: Date })
  @Prop()
  createdAt: Date;

  @ApiProperty({ type: Date })
  @Prop()
  updatedAt: Date;
}

export const JournalSchema = SchemaFactory.createForClass(Journal);

export type JournalDocument = HydratedDocument<Journal>;
