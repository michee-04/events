/* eslint-disable @typescript-eslint/no-unused-vars */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import mongoose, { Document, HydratedDocument } from 'mongoose';

export enum SubscribeStatus {
  PENDING_PAYMENT = 'pending_payment',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FREE = 'free',
  REFUNDED = 'refunded',
}

@Schema({
  collection: 'subscribe',
  timestamps: true,
})
export class Subscribe extends Document {
  @ApiProperty({ type: String, example: '66c39ca0de267891d423a9e8' })
  _id: mongoose.Schema.Types.ObjectId;

  @ApiProperty({ type: String, example: "L'id de l'utilisateur" })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @ApiProperty({
    type: String,
    example: "L'id de l'événements",
  })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true })
  eventId: mongoose.Schema.Types.ObjectId;

  @ApiProperty({
    enum: SubscribeStatus,
    example: SubscribeStatus.PENDING_PAYMENT,
    description:
      "Statut de l'inscription (pending_payment, completed, cancelled, refunded)",
  })
  @Prop({
    type: String,
    enum: SubscribeStatus,
    default: SubscribeStatus.PENDING_PAYMENT,
  })
  status: SubscribeStatus;

  @ApiProperty({
    type: String,
    example: 'cs_test_...',
    description: 'ID de la session Stripe (pour les paiements)',
    nullable: true,
    required: false,
  })
  @Prop({ type: String, nullable: true })
  stripeSessionId?: string;

  @ApiProperty({
    type: String,
    example: 'pi_test_...',
    description: "ID de l'intent de paiement Stripe (après succès)",
    nullable: true,
    required: false,
  })
  @Prop({ type: String, nullable: true })
  stripePaymentIntentId?: string;

  @ApiProperty({
    type: String,
    example: '/path/to/ticket/ticket-event.pdf',
    description: 'Chemin du document/ticket généré',
    nullable: true,
    required: false,
  })
  @Prop({ type: String, nullable: true })
  ticketDocumentPath?: string;

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

export const SubscribeSchema = SchemaFactory.createForClass(Subscribe);

export type SubscribeDocument = HydratedDocument<Subscribe>;
