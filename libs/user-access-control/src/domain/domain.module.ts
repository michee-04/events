import { LibCoreModule } from '@app/core';
import { LibJournalDomainModule } from '@app/journal/domain/domain.module';
import { LibNotificationInfrastructureModule } from '@app/notification/infrastructure/infrastructure.module';
import { Module } from '@nestjs/common';
import { LibUserAccessControlInfrastructureModule } from '../infrastructure/infrastructure.module';
import { AuthService } from './services/auth.service';
import { GroupService } from './services/group.service';
import { GroupAssignmentService } from './services/groupAssignment.service';
import { RoleService } from './services/role.service';
import { RoleAssignmentService } from './services/roleAssignment.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    LibCoreModule,
    LibJournalDomainModule,
    LibNotificationInfrastructureModule,
    LibUserAccessControlInfrastructureModule,
  ],
  providers: [
    AuthService,
    RoleService,
    RoleAssignmentService,
    GroupService,
    GroupAssignmentService,
    UserService,
  ],
  exports: [
    AuthService,
    RoleService,
    RoleAssignmentService,
    GroupService,
    GroupAssignmentService,
    UserService,
  ],
})
export class LibUserAccessControlDomainModule {}
