import { ModelDefinition } from '@nestjs/mongoose';

import { Group, GroupSchema } from './group';
import { GroupAssignment, GroupAssignmentSchema } from './groupAssignment';
import { LoginOtp, LoginOtpSchema } from './loginOtp';
import {
  RecoverPasswordOtp,
  RecoverPasswordOtpSchema,
} from './recoverPasswordOtp';
import { Role, RoleSchema } from './role';
import { RoleAssignment, RoleAssignmentSchema } from './roleAssignment';
import { Token, TokenSchema } from './token';
import { User, UserSchema } from './user';

export const ModelsMainProviders: ModelDefinition[] = [
  { name: Group.name, schema: GroupSchema },
  { name: GroupAssignment.name, schema: GroupAssignmentSchema },
  { name: LoginOtp.name, schema: LoginOtpSchema },
  { name: RecoverPasswordOtp.name, schema: RecoverPasswordOtpSchema },
  { name: Role.name, schema: RoleSchema },
  { name: RoleAssignment.name, schema: RoleAssignmentSchema },
  { name: Token.name, schema: TokenSchema },
  { name: User.name, schema: UserSchema },
];
