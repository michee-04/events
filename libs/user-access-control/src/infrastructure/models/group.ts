import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, HydratedDocument } from 'mongoose';

@Schema({
  collection: 'groups',
  timestamps: true,
})
export class Group extends Document {
  @ApiProperty({ type: String, example: '66c39ca0de267891d423a9e8' })
  _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: String, example: 'Admins' })
  @Prop({ type: String, required: true })
  label: string;

  @ApiProperty({ type: String, example: 'admins' })
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @ApiProperty({ type: String, example: "Groupe d'administrateurs" })
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['66c39ca0de267891d423a9e8'],
    default: [],
  })
  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [] })
  roles: (mongoose.Schema.Types.ObjectId | string)[];

  @ApiProperty({ example: {}, default: {} })
  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  metadata: Record<string, any> = {};

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

export const GroupSchema = SchemaFactory.createForClass(Group);

export type GroupDocument = HydratedDocument<Group>;
