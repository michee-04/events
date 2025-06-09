import { LibEventsModule } from '@app/events';
import { LibNotificationModule } from '@app/notification';
import { Module } from '@nestjs/common';
import { LibSubscribeInfrastructureModule } from '../infrastructure/infrastructure.module';
import { PdfService } from './services/pdf.service';
import { StripeService } from './services/stripe.service';
import { SubscribeService } from './services/subscribe.service';

@Module({
  imports: [
    LibSubscribeInfrastructureModule,
    LibEventsModule,
    LibNotificationModule,
  ],
  providers: [SubscribeService, PdfService, StripeService],
  exports: [SubscribeService, PdfService, StripeService],
})
export class LibSubscribeDomainModule {}
