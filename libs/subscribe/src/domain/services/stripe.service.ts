import { Injectable } from '@nestjs/common';

export type EventDocument = {
  _id: string;
  title: string;
  description: string;
  price: number;
};

@Injectable()
export class StripeService {
  // private stripe: Stripe
}
