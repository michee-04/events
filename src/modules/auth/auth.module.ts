import { LibJournalModule } from '@app/journal';
import { LibNotificationModule } from '@app/notification';
import { LibUserAccessControlModule } from '@app/user-access-control';
import { Module } from '@nestjs/common';
import {
  AdminAccountController,
  AdminAuthController,
} from './controller/admin';
import { AccountController } from './controller/user';
import { AuthController } from './controller/user/auth.controller';

@Module({
  imports: [
    LibNotificationModule,
    LibJournalModule,
    LibUserAccessControlModule,
  ],
  controllers: [
    AuthController,
    AccountController,
    AdminAuthController,
    AdminAccountController,
  ],
})
export class ApiAuthModule {}
