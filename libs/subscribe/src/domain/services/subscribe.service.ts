/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorResult } from '@app/common/utils';
import { EventsRepository } from '@app/events/infrastructure/repositories/events.repository';
import { NotifyService } from '@app/notification/infrastructure/services/notify.service';
import { SubscribeRepository } from '@app/subscribe/infrastructure/repositories/subscribe.repository';
import { Injectable, Logger } from '@nestjs/common';
import { PdfService } from './pdf.service';

@Injectable()
export class SubscribeService {
  private readonly logger = new Logger(SubscribeService.name);

  constructor(
    private readonly subscribeRepository: SubscribeRepository,
    private readonly eventsRepository: EventsRepository,
    private readonly pdfService: PdfService,
    private readonly notifyService: NotifyService,
  ) {}

  async subscribe(user: any, eventId: string) {
    const event = await this.eventsRepository.getOne({
      _id: eventId,
      deleted: false,
    });
    if (!event) {
      throw new ErrorResult({
        code: 404_030,
        clean_message: 'Evévenments introuvable',
        message: 'Evévenments introuvable',
      });
    }

    const existing = await this.subscribeRepository.getOne({
      userId: user._id,
      eventId,
    });

    if (existing) {
      throw new ErrorResult({
        code: 409_034,
        clean_message: 'Déjà inscrit à cet événement',
        message: `L'utilisateur ${user._id} s'est déjà inscrit à cet événement`,
      });
    }

    // if (event.isPaid) {
    //   const session = await this.stripeService.createCheckoutSession(
    //     user._id,
    //     event,
    //   );
    //   return { url: session.url };
    // }

    const ticket = await this.pdfService.generateTicket(user, event);

    const subscribeInput = {
      userId: user._id,
      eventId: eventId as any,
    };

    const attachments = [
      {
        filename: `ticket-${event.title}.pdf`,
        content: ticket,
        contentType: 'application/pdf',
      },
    ];

    const lang: string | null = 'fr';

    const payload = { lang, isFr: lang === 'fr' };
    Promise.all([
      this.notifyService.notifyByEmail(
        'mail-email-change-confirmation',
        payload,
        user.email,
        user._id.toString(),
        attachments,
      ),
    ]).catch(() => {});

    await this.subscribeRepository.create(subscribeInput);

    // await this.mailService.sendTicketEmail(user.email, ticket, event.title);
    // await this.subscriptionModel.create({ userId: user._id, eventId });
    // return { message: 'Inscription réussie' };
  }
}
