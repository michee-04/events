import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { LibCoreModule } from '@app/core';
import { LibJournalModule } from '@app/journal';
import { ModelsMainProviders } from './models';
import { EmailTemplateRepository } from './repositories/emailTemplate.repository';
import { UserNotificationRepository } from './repositories/userNotification.repository';
import { NotifyService } from './services/notify.service';

@Module({
  imports: [
    LibCoreModule,
    LibJournalModule,
    MongooseModule.forFeature(
      ModelsMainProviders,
      MAIN_DATABASE_CONNECTION_NAME,
    ),
  ],
  providers: [
    EmailTemplateRepository,
    UserNotificationRepository,
    NotifyService,
  ],
  exports: [EmailTemplateRepository, UserNotificationRepository, NotifyService],
})
export class LibNotificationInfrastructureModule {}
