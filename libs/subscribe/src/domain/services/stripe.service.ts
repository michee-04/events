import { ErrorResult } from '@app/common/utils';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export type EventDocument = {
  _id: string;
  title: string;
  description: string;
  price: number;
};

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
    );
  }

  async createCheckoutSession(
    amount: number,
    productName: string,
    userId: string,
    eventId: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'xof', // ou 'usd', 'xof', etc.
              product_data: {
                name: productName,
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${this.configService.get<string>('STRIPE_FRONT_URL')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get<string>('STRIPE_FRONT_URL')}/payment-cancel`,
        metadata: {
          userId: userId,
          eventId: eventId,
        },
      });
      return session;
    } catch (error) {
      console.error('Erreur lors de la création de la session Stripe:', error);
      throw new ErrorResult({
        code: 404_451,
        clean_message: 'Erreur lors de la création de la session Stripe:',
        message: `Erreur lors de la création de la session Stripe: ${error}`,
      });
    }
  }

  async retrieveCheckoutSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      throw new ErrorResult({
        code: 404_452,
        clean_message:
          'Impossible de récupérer les détails de la session de paiement',
        message: `Impossible de récupérer les détails de la session de paiement: ${error}`,
      });
    }
  }
}
