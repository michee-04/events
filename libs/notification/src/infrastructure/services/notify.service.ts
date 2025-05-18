import { Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';
import { SendMailOptions } from 'nodemailer';
import { Attachment } from 'nodemailer/lib/mailer';

import { AppConfig } from '@app/core/config';
import { MailService } from '@app/core/services/mailer';
import { JournalService } from '@app/journal/domain/services/journal.service';
import { EmailTemplateRepository } from '../repositories/emailTemplate.repository';
import { UserNotificationRepository } from '../repositories/userNotification.repository';

@Injectable()
export class NotifyService {
  private readonly isEmailEnabled: boolean = false;
  private readonly appName: string;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly mailService: MailService,

    private readonly emailTemplateRepository: EmailTemplateRepository,
    private readonly userNotificationRepository: UserNotificationRepository,
    private readonly journalService: JournalService,
  ) {
    this.isEmailEnabled = this.config.get('LIB_NOTIFICATION_EMAIL_ENABLED', {
      infer: true,
    });
    this.appName = this.config.get('APP_NAME', { infer: true });

    if (!this.isEmailEnabled) {
      console.warn('EMAIL Notification is disabled');
    }
  }

  async notifyByEmail(
    slug: string,
    payload: Record<string, any>,
    recipients: string | string[],
    userId?: string,
    attachments?: Attachment[],
  ) {
    if (!this.isEmailEnabled) return null;

    const template = await this.emailTemplateRepository.getActiveBySlug(slug);

    if (!template) {
      this.log('error', `EMAIL template not found with slug: ${slug}`);
      return null;
    }

    let subject = this.appName;
    if (template.subject) {
      subject = Handlebars.compile(template.subject)(payload);
    }

    let message = '';
    if (template.message) {
      message = Handlebars.compile(template.message)(payload);
    }

    const html = Handlebars.compile(template.template)(payload);

    if (userId && message) {
      this.userNotificationRepository
        .create({ userId, message })
        .catch((error) => {
          this.log('error', '[USER NOTIFICATION CREATE ERROR]', error);
        });
    }

    const mailOptions: Omit<SendMailOptions, 'from'> = {
      subject,
      html,
      text: message,
      to: recipients,
      attachments,
    };

    if (this.mailService.clients.MAILHOG) {
      this.mailService
        .sendWithClient(this.mailService.clients.MAILHOG, mailOptions)
        .catch((error) => {
          this.log('error', '[MAILHOG ERROR]', error);
        });
    }

    return this.mailService.send(mailOptions).catch((error) => {
      this.log('error', '[MAILER MAIN CLIENT ERROR]', error);
    });
  }

  private log(level: LogLevel, message?: string, data?: Record<string, any>) {
    this.journalService.save(
      'LibNotificationInfrastructureModule',
      this.constructor.name,
      level,
      message || 'Service error',
      data,
    );
  }
}
