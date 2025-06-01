import { LibCoreModule } from '@app/core';
import { LibNotificationModule } from '@app/notification';
import { Module } from '@nestjs/common';
import { ApiUserAccessControlModule } from './modules/access-control/access-control.module';
import { ApiAuthModule } from './modules/auth/auth.module';
import { ApiCoreModule } from './modules/core/core.module';
import { ApiEventModule } from './modules/event/evenement.module';
import { ApiJournalModule } from './modules/journal/journal.module';
import { ApiNotificationModule } from './modules/notification/notification.module';
import { ApiProgramModule } from './modules/programme/programme.module';

@Module({
  imports: [
    LibCoreModule,
    LibNotificationModule,
    ApiCoreModule,
    ApiUserAccessControlModule,
    ApiAuthModule,
    ApiJournalModule,
    ApiNotificationModule,
    ApiEventModule,
    ApiProgramModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
