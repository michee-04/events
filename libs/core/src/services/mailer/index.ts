import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendMailOptions } from 'nodemailer';

import { AppConfig } from '../../config';
import { MailerTransporter } from './transport';

type MailClientKey = 'SENDGRID' | 'MAILHOG' | 'MAILTRAP' | 'GMAIL';
type MailClient = { from: string; transport: MailerTransporter };
type MailClients = Record<MailClientKey, MailClient | null>;

@Injectable()
export class MailService {
  private readonly activeClient: MailClient;
  readonly clients: MailClients;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.clients = {
      SENDGRID: this.createTransporter('SENDGRID'),
      MAILHOG: this.createTransporter('MAILHOG'),
      MAILTRAP: this.createTransporter('MAILTRAP'),
      GMAIL: this.createTransporter('GMAIL'),
    };

    const activeClientKey = this.config
      .get(`LIB_NOTIFICATION_MAILER_CLIENT_NAME`, { infer: true })
      .toUpperCase();

    this.activeClient = this.clients[activeClientKey];
    if (!this.activeClient) {
      throw new Error(
        `Le client actif ${activeClientKey} requiert que la variable [LIB_NOTIFICATION_MAILER_${activeClientKey}_ENABLED] soit 'true'`,
      );
    }
  }

  private createTransporter(clientName: MailClientKey): MailClient | null {
    const isEnabled = this.config.get(
      `LIB_NOTIFICATION_MAILER_${clientName}_ENABLED`,
      { infer: true },
    );
    if (!isEnabled) return null;

    const from = this.config.get(
      `LIB_NOTIFICATION_MAILER_${clientName}_DEFAULT_MAIL_FROM`,
      { infer: true },
    );
    const transport = new MailerTransporter({
      host: this.config.get(`LIB_NOTIFICATION_MAILER_${clientName}_HOST`, {
        infer: true,
      }),
      port: this.config.get(`LIB_NOTIFICATION_MAILER_${clientName}_PORT`, {
        infer: true,
      }),
      secure:
        this.config.get(`LIB_NOTIFICATION_MAILER_${clientName}_ENABLE_TLS`, {
          infer: true,
        }) === ('true' as any),
      auth: {
        user: this.config.get(
          `LIB_NOTIFICATION_MAILER_${clientName}_USERNAME`,
          { infer: true },
        ),
        pass: this.config.get(
          `LIB_NOTIFICATION_MAILER_${clientName}_PASSWORD`,
          { infer: true },
        ),
      },
    });
    return { from, transport };
  }

  async send(mailOptions: Omit<SendMailOptions, 'from'>) {
    await this.sendWithClient(this.activeClient, mailOptions);
  }

  // async send(mailOptions: Omit<SendMailOptions, 'from'>) {
  //   console.log('🟢 Active Client Config:', {
  //     from: this.activeClient.from,
  //     transport: this.activeClient.transport,
  //   });

  //   try {
  //     const result = await this.sendWithClient(this.activeClient, mailOptions);
  //     console.log('🟢 Email sent successfully to:', mailOptions.to);
  //     return result;
  //   } catch (error) {
  //     console.error('🔴 Email send error:', {
  //       error: error.message,
  //       stack: error.stack,
  //       response: error.response,
  //     });
  //     throw error;
  //   }
  // }

  async sendWithClient(
    client: MailClient,
    mailOptions: Omit<SendMailOptions, 'from'>,
  ) {
    await client.transport.sendMail({
      ...mailOptions,
      from: this.activeClient.from,
    });
  }
}
