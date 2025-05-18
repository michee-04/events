import {
  JOURNAL_DATABASE_CONNECTION_NAME,
  MAIN_DATABASE_CONNECTION_NAME,
} from '@app/common/constants';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig, validateConfig } from './config';
import { MailService } from './services/mailer';
import { QrcodeService } from './services/qrCode/qrCode.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateConfig,
    }),
    MongooseModule.forRootAsync({
      connectionName: MAIN_DATABASE_CONNECTION_NAME,
      inject: [ConfigService],
      useFactory: async (config: ConfigService<AppConfig, true>) => ({
        uri: config.get('MAIN_DATABASE', { infer: true }),
      }),
    }),
    MongooseModule.forRootAsync({
      connectionName: JOURNAL_DATABASE_CONNECTION_NAME,
      inject: [ConfigService],
      useFactory: async (config: ConfigService<AppConfig, true>) => ({
        uri: config.get('JOURNAL_DATABASE', { infer: true }),
      }),
    }),
  ],
  providers: [QrcodeService, MailService],
  exports: [QrcodeService, MailService],
})
export class LibCoreModule {}
