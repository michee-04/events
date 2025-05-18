import * as nodemailer from 'nodemailer';

interface MailerConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class MailerTransporter {
  private transporter: nodemailer.Transporter;

  constructor(config: MailerConfig) {
    this.transporter = nodemailer.createTransport(config);
  }

  async sendMail(mailOptions: nodemailer.SendMailOptions) {
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
    }
  }
}
