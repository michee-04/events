/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, HydratedDocument } from 'mongoose';

@Schema({
  collection: 'Programme',
  timestamps: true,
})
export class Programme extends Document {
  @ApiProperty({ type: String, example: '66c39ca0de267891d423a9e8' })
  _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: String, example: 'Accueil' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ type: String, example: 'Le speaker' })
  @Prop({ type: String, required: true })
  speaker: string;

  @ApiProperty({ type: Date, example: '2000-01-01T00:00:00.000Z' })
  @Prop({ type: Date, required: true })
  startDate: Date;

  @ApiProperty({ type: Date, example: '2000-01-02T00:00:00.000Z' })
  @Prop({ type: Date, required: true })
  endDate: Date;

  @ApiProperty({ type: String, example: '66d8a7cdff12345bca987654' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true })
  eventId: mongoose.Types.ObjectId;

  @ApiProperty({ type: Boolean, example: false, default: false })
  @Prop({ type: Boolean, default: false })
  deleted: boolean;

  @ApiProperty({ type: Date, example: null, nullable: true })
  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @ApiProperty({ type: Date })
  @Prop()
  createdAt: Date;

  @ApiProperty({ type: Date })
  @Prop()
  updatedAt: Date;
}

export const ProgrammeSchema = SchemaFactory.createForClass(Programme);

export type ProgrammeDocument = HydratedDocument<Programme>;
