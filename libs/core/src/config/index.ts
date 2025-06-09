import { plainToInstance, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  Validate,
  ValidateIf,
  validateSync,
} from 'class-validator';
import * as ms from 'ms';

import { Environment, MailerClient } from '../types';

export class AppConfig {
  // ================================= GLOBAL
  @IsEnum(Environment)
  NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  APP_NAME: string;

  @IsString()
  @IsNotEmpty()
  MAIN_DATABASE: string;

  @IsString()
  @IsNotEmpty()
  JOURNAL_DATABASE: string;

  // ================================= API APP
  @IsInt()
  @Min(0)
  @Max(65_535)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  API_APP_PORT: number = 6000;

  @IsUrl({ require_protocol: true, require_tld: false })
  API_APP_BASE_URL: string;

  @IsString()
  @IsNotEmpty()
  API_APP_LOGS_DIRECTORY: string;

  // ================================= LIBRAIRIES
  // ------------- User
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_USER_PASSWORD_VALIDATION_ENABLED: boolean = false;

  @IsString()
  @IsNotEmpty()
  LIB_USER_DEFAULT_PASSWORD: string;

  @IsEmail()
  LIB_USER_DEFAULT_SUPER_ADMIN_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  LIB_USER_DEFAULT_SUPER_ADMIN_PASSWORD: string;

  @IsInt()
  @Min(5)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  LIB_USER_OTP_EXPIRES_IN_MIN: number = 10;

  @IsString()
  @IsOptional()
  LIB_USER_WHITELIST_EMAILS: string;

  @IsString()
  @IsNotEmpty()
  LIB_USER_WHITELIST_OTP: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_USER_TOKEN_VALIDATION_ENABLED: boolean = false;

  @IsString()
  @IsNotEmpty()
  LIB_USER_JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  LIB_USER_JWT_ISSUER: string;

  @IsString()
  @IsNotEmpty()
  @Validate(
    (value: ms.StringValue) => {
      const duration = ms(value);
      return typeof duration === 'number' && duration > 0;
    },
    {
      message:
        'LIB_USER_ACCESS_CONTROL_JWT_ACCESS_TOKEN_EXPIRES_IN must be a valid duration string (e.g.,"1d", "1h", "30m", "600s").',
    },
  )
  LIB_USER_JWT_TOKEN_EXPIRES_IN: ms.StringValue;

  @IsString()
  @IsNotEmpty()
  @Validate(
    (value: ms.StringValue) => {
      const duration = ms(value);
      return typeof duration === 'number' && duration > 0;
    },
    {
      message:
        'LIB_USER_ACCESS_CONTROL_JWT_REFRESH_TOKEN_EXPIRES_IN must be a valid duration string (e.g.,"1d", "1h", "30m", "600s").',
    },
  )
  LIB_USER_JWT_REFRESH_TOKEN_EXPIRES_IN: ms.StringValue;

  // Email Verification
  @IsInt()
  @Min(5)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  LIB_USER_EMAIL_VERIFICATION_TOKEN_EXPIRES_IN_MIN: number = 10;

  @IsString()
  @IsNotEmpty()
  LIB_USER_EMAIL_VERIFICATION_CIPHER_KEY: string;

  @IsString()
  @IsNotEmpty()
  LIB_USER_EMAIL_VERIFICATION_CIPHER_IV: string;

  // Api Key
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_USER_API_KEY_VERIFICATION_ENABLED: boolean = false;

  @IsString()
  @IsNotEmpty()
  LIB_USER_API_KEY_CIPHER_KEY: string;

  @IsString()
  @IsNotEmpty()
  LIB_USER_API_KEY_CIPHER_IV: string;

  // ------------- Journal
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_JOURNAL_ENABLED: boolean = false;

  // ------------- Notification
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_NOTIFICATION_EMAIL_ENABLED: boolean = false;

  @IsEnum(MailerClient)
  LIB_NOTIFICATION_MAILER_CLIENT_NAME: string;

  // Mailtrap
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_NOTIFICATION_MAILER_MAILTRAP_ENABLED: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_NOTIFICATION_MAILER_MAILTRAP_ENABLE_TLS: boolean = false;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_MAILTRAP_ENABLED === true)
  @IsString()
  @IsNotEmpty()
  LIB_NOTIFICATION_MAILER_MAILTRAP_HOST: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_MAILTRAP_ENABLED === true)
  @IsInt()
  @Min(0)
  @Max(65_535)
  @Transform(({ value }) => parseInt(value, 10))
  LIB_NOTIFICATION_MAILER_MAILTRAP_PORT: number = 1025;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_MAILTRAP_ENABLED === true)
  @IsString()
  @IsOptional()
  LIB_NOTIFICATION_MAILER_MAILTRAP_USERNAME: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_MAILTRAP_ENABLED === true)
  @IsString()
  @IsOptional()
  LIB_NOTIFICATION_MAILER_MAILTRAP_PASSWORD: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_MAILTRAP_ENABLED === true)
  @IsEmail()
  LIB_NOTIFICATION_MAILER_MAILTRAP_DEFAULT_MAIL_FROM: string;

  // Mailhog
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_NOTIFICATION_MAILER_MAILHOG_ENABLED: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_NOTIFICATION_MAILER_MAILHOG_ENABLE_TLS: boolean = false;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_MAILHOG_ENABLED === true)
  @IsString()
  @IsNotEmpty()
  LIB_NOTIFICATION_MAILER_MAILHOG_HOST: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_MAILHOG_ENABLED === true)
  @IsInt()
  @Min(0)
  @Max(65_535)
  @Transform(({ value }) => parseInt(value, 10))
  LIB_NOTIFICATION_MAILER_MAILHOG_PORT: number = 1025;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_MAILHOG_ENABLED === true)
  @IsString()
  @IsOptional()
  LIB_NOTIFICATION_MAILER_MAILHOG_USERNAME: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_MAILHOG_ENABLED === true)
  @IsString()
  @IsOptional()
  LIB_NOTIFICATION_MAILER_MAILHOG_PASSWORD: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_MAILHOG_ENABLED === true)
  @IsEmail()
  LIB_NOTIFICATION_MAILER_MAILHOG_DEFAULT_MAIL_FROM: string;

  // Sendgrid
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_NOTIFICATION_MAILER_SENDGRID_ENABLED: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_NOTIFICATION_MAILER_SENDGRID_ENABLE_TLS: boolean = false;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_SENDGRID_ENABLED === true)
  @IsString()
  @IsNotEmpty()
  LIB_NOTIFICATION_MAILER_SENDGRID_HOST: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_SENDGRID_ENABLED === true)
  @IsInt()
  @Min(0)
  @Max(65_535)
  @Transform(({ value }) => parseInt(value, 10))
  LIB_NOTIFICATION_MAILER_SENDGRID_PORT: number = 25;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_SENDGRID_ENABLED === true)
  @IsString()
  @IsOptional()
  LIB_NOTIFICATION_MAILER_SENDGRID_USERNAME: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_SENDGRID_ENABLED === true)
  @IsString()
  @IsOptional()
  LIB_NOTIFICATION_MAILER_SENDGRID_PASSWORD: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_SENDGRID_ENABLED === true)
  @IsEmail()
  LIB_NOTIFICATION_MAILER_SENDGRID_DEFAULT_MAIL_FROM: string;

  // Gmail
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_NOTIFICATION_MAILER_GMAIL_ENABLED: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_NOTIFICATION_MAILER_GMAIL_ENABLE_TLS: boolean = false;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_GMAIL_ENABLED === true)
  @IsString()
  @IsNotEmpty()
  LIB_NOTIFICATION_MAILER_GMAIL_HOST: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_GMAIL_ENABLED === true)
  @IsInt()
  @Min(0)
  @Max(65_535)
  @Transform(({ value }) => parseInt(value, 10))
  LIB_NOTIFICATION_MAILER_GMAIL_PORT: number = 25;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_GMAIL_ENABLED === true)
  @IsString()
  @IsOptional()
  LIB_NOTIFICATION_MAILER_GMAIL_USERNAME: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_GMAIL_ENABLED === true)
  @IsString()
  @IsOptional()
  LIB_NOTIFICATION_MAILER_GMAIL_PASSWORD: string;

  @ValidateIf((o) => o.LIB_NOTIFICATION_MAILER_GMAIL_ENABLED === true)
  @IsEmail()
  LIB_NOTIFICATION_MAILER_GMAIL_DEFAULT_MAIL_FROM: string;

  // ------------- File Storage
  // Storage
  @IsString()
  @IsNotEmpty()
  LIB_FILESTORAGE_BUCKETS_WHITELIST: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  LIB_FILESTORAGE_FILE_UPLOAD_MAX_SIZE_MB: number = 10;

  @IsString()
  @IsNotEmpty()
  LIB_FILESTORAGE_FILE_UPLOAD_ALLOWED_TYPES: string;

  // Minio
  @IsString()
  @IsNotEmpty()
  LIB_MINIO_HOST: string;

  @IsString()
  @IsNotEmpty()
  LIB_MINIO_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  LIB_MINIO_SECRET_KEY: string;

  @IsInt()
  @Min(0)
  @Max(65_535)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  LIB_MINIO_API_PORT: number = 9000;

  @IsString()
  @IsNotEmpty()
  LIB_MINIO_BUCKET_NAME: string;

  @IsString()
  @IsNotEmpty()
  LIB_MINIO_REGION: string;

  @IsInt()
  @Min(0)
  @Max(65_535)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  LIB_MINIO_CONSOLE_PORT: number = 9000;

  @IsInt()
  @Min(0)
  @Max(65_535)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  LIB_MINIO_EXT_API_PORT: number = 9000;

  @IsInt()
  @Min(0)
  @Max(65_535)
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  LIB_MINIO_EXT_CONSOLE_PORT: number = 9000;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  LIB_MINIO_USE_SSL: boolean = false;

  // ------------- Pdf Doc
  // Storage
  @IsString()
  @IsNotEmpty()
  PDF_AUTHOR: string;
}

export function validateConfig(payload: Record<string, any>) {
  const config = plainToInstance(AppConfig, payload, {
    exposeDefaultValues: true,
  });

  const errors = validateSync(config, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const message = errors
      .map((e) =>
        Object.values(e.constraints || {})
          .map((msg) => `- ${msg}`)
          .join('\n'),
      )
      .join('\n');

    throw new Error(
      `${AppConfig.name} environment variables validation failed\n${message}`,
    );
  }

  return config;
}
