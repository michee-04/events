import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { LibCoreModule } from '@app/core';
import { ModelsMainProviders } from './models';
import { GroupRepository } from './repositories/group.repository';
import { GroupAssignmentRepository } from './repositories/groupAssigment.repository';
import { LoginOtpRepository } from './repositories/loginOtp.repository';
import { RecoverPasswordOtpRepository } from './repositories/recoverPasswordOtp.repository';
import { RoleRepository } from './repositories/role.repository';
import { RoleAssignmentRepository } from './repositories/roleAssigment.repository';
import { TokenRepository } from './repositories/token.repository';
import { UserRepository } from './repositories/user.repository';
import { AccessControlDefaultsService } from './services/defaults.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    LibCoreModule,
    MongooseModule.forFeature(
      ModelsMainProviders,
      MAIN_DATABASE_CONNECTION_NAME,
    ),
  ],
  providers: [
    GroupRepository,
    GroupAssignmentRepository,
    LoginOtpRepository,
    RecoverPasswordOtpRepository,
    RoleRepository,
    RoleAssignmentRepository,
    TokenRepository,
    UserRepository,
    AccessControlDefaultsService,
    TokenService,
  ],
  exports: [
    GroupRepository,
    GroupAssignmentRepository,
    LoginOtpRepository,
    RecoverPasswordOtpRepository,
    RoleRepository,
    RoleAssignmentRepository,
    TokenRepository,
    UserRepository,
    AccessControlDefaultsService,
    TokenService,
  ],
})
export class LibUserAccessControlInfrastructureModule {}
