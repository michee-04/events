import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, HydratedDocument } from 'mongoose';

@Schema({
  collection: 'email_templates',
  timestamps: true,
})
export class EmailTemplate extends Document {
  @ApiProperty({ type: String, example: '66c39ca0de267891d423a9e8' })
  _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: String, example: "Mail pour OTP d'authentification" })
  @Prop({ type: String, required: true })
  label: string;

  @ApiProperty({
    type: String,
    example: 'Code de vérification pour accéder à CHAT ANONYMOUS',
  })
  @Prop({ type: String, required: true })
  subject: string;

  @ApiProperty({ type: String, example: 'mail-authentication-otp' })
  @Prop({ type: String, required: true, unique: true })
  slug: string;

  @ApiProperty({ type: String, example: "Mail pour OTP d'authentification" })
  @Prop({ type: String, required: true })
  description: string;

  @ApiProperty({
    type: String,
    example:
      '<p>Votre code de vérification pour accéder à CHAT ANONYMOUS est : 000.</p>',
  })
  @Prop({ type: String, required: true })
  template: string;

  @ApiProperty({
    type: String,
    example:
      'Votre code de vérification pour accéder à CHAT ANONYMOUS est : 000.',
  })
  @Prop({ type: String, required: true })
  message: string;

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

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);

export type EmailTemplateDocument = HydratedDocument<EmailTemplate>;
