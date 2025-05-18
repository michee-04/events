import { Module } from '@nestjs/common';

import { LibCoreModule } from '@app/core';
import { LibJournalInfrastructureModule } from '@app/journal/infrastructure/infrastructure.module';
import { LibNotificationInfrastructureModule } from '../infrastructure/infrastructure.module';
import { EmailTemplateService } from './services/emailTemplate.service';
import { UserNotificationService } from './services/userNotification.service';

@Module({
  imports: [
    LibCoreModule,
    LibJournalInfrastructureModule,
    LibNotificationInfrastructureModule,
  ],
  providers: [EmailTemplateService, UserNotificationService],
  exports: [EmailTemplateService, UserNotificationService],
})
export class LibNotificationDomainModule {}
