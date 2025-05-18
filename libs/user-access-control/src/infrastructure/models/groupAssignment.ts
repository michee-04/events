import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, HydratedDocument } from 'mongoose';

@Schema({
  collection: 'group_assignments',
  timestamps: true,
})
export class GroupAssignment extends Document {
  @ApiProperty({ type: String, example: '66c39ca0de267891d423a9e8' })
  _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: String, example: '66c39ca0de267891d423a9e8' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, index: true })
  userId: mongoose.Schema.Types.ObjectId | string;

  @ApiProperty({ type: String, example: '66c39ca0de267891d423a9e8' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  groupId: mongoose.Schema.Types.ObjectId | string;

  @ApiProperty({ type: String, example: 'admins' })
  @Prop({ type: String, required: true })
  groupSlug: string;

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

export const GroupAssignmentSchema =
  SchemaFactory.createForClass(GroupAssignment);

export type GroupAssignmentDocument = HydratedDocument<GroupAssignment>;
