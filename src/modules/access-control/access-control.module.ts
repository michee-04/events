import { LibJournalModule } from '@app/journal';
import { LibUserAccessControlModule } from '@app/user-access-control';
import { Module } from '@nestjs/common';
import {
  AdminController,
  GroupAssignmentController,
  RoleAssignmentController,
  RoleController,
  UserController,
} from './controllers';

@Module({
  imports: [LibUserAccessControlModule, LibJournalModule],
  controllers: [
    AdminController,
    RoleController,
    UserController,
    GroupAssignmentController,
    RoleAssignmentController,
  ],
})
export class ApiUserAccessControlModule {}
