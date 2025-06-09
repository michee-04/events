/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorResult } from '@app/common/utils';
import { EventsRepository } from '@app/events/infrastructure/repositories/events.repository';
import { NotifyService } from '@app/notification/infrastructure/services/notify.service';
import { SubscribeStatus } from '@app/subscribe/infrastructure/models/subscribe';
import { SubscribeRepository } from '@app/subscribe/infrastructure/repositories/subscribe.repository';
import { Injectable, Logger } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { StripeService } from './stripe.service';

@Injectable()
export class SubscribeService {
  private readonly logger = new Logger(SubscribeService.name);

  constructor(
    private readonly subscribeRepository: SubscribeRepository,
    private readonly eventsRepository: EventsRepository,
    private readonly pdfService: PdfService,
    private readonly notifyService: NotifyService,
    private readonly stripeService: StripeService,
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

    if (event.registeredCount >= event.capacity) {
      throw new ErrorResult({
        code: 400_035, // Code d'erreur pour capacité atteinte
        clean_message: "La capacité de l'événement est atteinte",
        message: `L'événement ${event.title} a atteint sa capacité maximale.`,
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

    if (event.isPaid) {
      const session = await this.stripeService.createCheckoutSession(
        event.price,
        event.title,
        user._id.toString(),
        event._id.toString(),
      );

      const subscribeInput = {
        userId: user._id,
        eventId: eventId as any,
        stripeSessionId: session.id,
      };

      await this.subscribeRepository.create(subscribeInput);

      return { url: session.url };
    }

    const ticket = await this.pdfService.generateTicket(user, event);

    const subscribeInput = {
      userId: user._id,
      eventId: eventId as any,
      status: SubscribeStatus.FREE,
    };

    const attachments = [
      {
        filename: `ticket-${event.title}.pdf`,
        content: ticket,
        contentType: 'application/pdf',
      },
    ];

    const lang: string | null = 'fr';

    const payload = { lang, isFr: lang === 'fr', eventName: event.title };
    Promise.all([
      this.notifyService.notifyByEmail(
        'mail-confirmation-evenement',
        payload,
        user.email,
        user._id.toString(),
        attachments,
      ),
    ]).catch(() => {});

    await this.subscribeRepository.create(subscribeInput);

    await this.eventsRepository.upsert(
      { _id: event._id },
      { $inc: { registeredCount: 1 } },
    );

    return {
      message:
        'Inscription réussie !!!  Un e-mail de confirmation a été envoyé.',
    };
  }

  /**
   * Confirme une inscription payante après que Stripe a signalé le succès du paiement.
   * Cette méthode est appelée par un endpoint backend lorsque le frontend redirige
   * après un paiement Stripe réussi (success_url).
   * @param sessionId L'ID de la session de paiement Stripe.
   * @returns Un objet Subscription mis à jour.
   */
  async confirmPaidSubscription(
    input: any,
    user: any,
  ): Promise<{ message: string }> {
    const { sessionId } = input;

    const session = await this.stripeService.retrieveCheckoutSession(sessionId);

    if (!session || session.payment_status !== 'paid') {
      throw new ErrorResult({
        code: 400_037,
        clean_message: 'Paiement non confirmé ou session invalide',
        message:
          "Le paiement pour cette session n'a pas été confirmé ou la session est invalide.",
      });
    }

    const { userId, eventId } = session.metadata;

    // Assurez-vous que l'inscription existe et est en attente de paiement
    const subscription = await this.subscribeRepository.getOne({
      userId,
      eventId,
      stripeSessionId: sessionId,
      status: 'pending_payment',
    });

    if (!subscription) {
      // Cela peut arriver si le webhook a déjà traité ou si l'ID de session ne correspond pas
      // Pour une approche sans webhook, c'est une vérification cruciale.
      // Si un abonnement 'completed' est trouvé pour cette session, on peut renvoyer un succès pour idempotence
      const completedSubscription = await this.subscribeRepository.getOne({
        userId,
        eventId,
        stripeSessionId: sessionId,
        status: 'completed',
      });
      if (completedSubscription) {
        return { message: 'Inscription déjà confirmée.' };
      }

      throw new ErrorResult({
        code: 400_038,
        clean_message: 'Inscription en attente non trouvée pour cette session',
        message: 'Inscription en attente non trouvée pour cette session.',
      });
    }

    const event = await this.eventsRepository.getOne({
      _id: eventId,
      deleted: false,
    });

    if (!user || !event) {
      this.logger.error(
        `Données utilisateur ou événement introuvables pour l'abonnement ${subscription._id}.`,
      );
      throw new ErrorResult({
        code: 400_039,
        clean_message:
          "Données utilisateur ou événement introuvables pour l'abonnement",
        message:
          "Données utilisateur ou événement introuvables pour l'abonnement.",
      });
    }

    const eventInfos = {
      title: event.title,
      location: event.location,
      startDate: event.startDate,
      isPaid: event.isPaid,
      price: event.price || null,
    };

    const ticketBuffer = await this.pdfService.generateTicket(user, eventInfos);

    // Mettre à jour le statut de l'inscription à 'completed'
    await this.subscribeRepository.update(
      { _id: subscription._id },
      {
        status: 'completed',
        stripePaymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
      },
    );

    // Mettre à jour le nombre de participants à l'événement
    await this.eventsRepository.upsert(
      { _id: event._id },
      { $inc: { registeredCount: 1 } },
    );

    const attachments = [
      {
        filename: `ticket-${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        content: ticketBuffer,
        contentType: 'application/pdf',
      },
    ];

    const lang: string | null = 'fr';
    const payload = {
      lang,
      isFr: lang === 'fr',
      eventName: event.title,
    };

    // Envoi de l'e-mail
    this.notifyService
      .notifyByEmail(
        'mail-confirmation-evenement', // Votre template d'e-mail
        payload,
        user.email,
        user._id.toString(),
        attachments,
      )
      .catch((error) => {
        this.logger.error(
          `Erreur lors de l'envoi de l'e-mail de confirmation pour l'événement payant ${event.title} à ${user.email}:`,
          error,
        );
      });

    this.logger.log(
      `Inscription payante confirmée et e-mail envoyé pour l'utilisateur ${userId} et l'événement ${eventId}.`,
    );
    return {
      message:
        'Paiement confirmé et inscription réussie ! Un e-mail de confirmation a été envoyé.',
    };
  }
}
