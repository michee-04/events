/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, HydratedDocument } from 'mongoose';

@Schema({
  collection: 'Events',
  timestamps: true,
})
export class Events extends Document {
  @ApiProperty({ type: String, example: '66c39ca0de267891d423a9e8' })
  _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: String, example: 'Tdev community' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({
    type: String,
    example: 'Tdev est un évenement de la communauté dev',
  })
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty({
    type: String,
    example: 'Agoe-Zongo',
  })
  @Prop({ type: String, required: true })
  location: string;

  @ApiProperty({
    type: String,
    example: 15,
  })
  @Prop({ type: Number, required: true })
  capacity: number;

  @ApiProperty({ type: Boolean, example: false, default: false })
  @Prop({ type: Boolean, default: false })
  isOnline: boolean;

  @ApiProperty({ type: Array<any>, example: ['#tdev'] })
  @Prop({ type: Array<any>, required: true })
  tags: Array<any>;

  // TODO: A remettre dans le model après avoir implementer le fileService
  // @ApiProperty({ type: String, example: 'http://localhost' })
  // @Prop({ type: String, required: false })
  // imageUrl: string;

  @ApiProperty({
    type: Date,
    example: '01/01/2000',
  })
  @Prop({ type: Date, required: true })
  startDate: Date;

  @ApiProperty({
    type: Date,
    example: '02/01/2000',
  })
  @Prop({ type: Date, required: true })
  endDate: Date;

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

export const EventsSchema = SchemaFactory.createForClass(Events);

export type EventsDocument = HydratedDocument<Events>;
