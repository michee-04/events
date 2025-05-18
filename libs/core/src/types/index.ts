export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

export enum MailerClient {
  Mailtrap = 'mailtrap',
  Mailhog = 'mailhog',
  Sendgrid = 'sendgrid',
  Gmail = 'gmail',
}

export type LogLevel = 'info' | 'warn' | 'error';

export type Logger = { log: LogFunc };

export type LogFunc = (
  level: LogLevel,
  message: string,
  data?: Record<string, any>,
) => void;
