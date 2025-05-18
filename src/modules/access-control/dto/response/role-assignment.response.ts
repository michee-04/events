import { RoleAssignment } from '@app/user-access-control/infrastructure/models/roleAssignment';
import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from 'src/modules/core/http';

export class RoleAssignmentResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty({ type: RoleAssignment })
  readonly data: RoleAssignment;
}

export class ListRoleAssignmentsResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty({ type: [RoleAssignment] })
  readonly data: RoleAssignment[];
}
