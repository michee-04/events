import { GroupAssignment } from '@app/user-access-control/infrastructure/models/groupAssignment';
import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from 'src/modules/core/http';

export class GroupAssignmentResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty({ type: GroupAssignment })
  readonly data: GroupAssignment;
}

export class ListGroupAssignmentsResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty({ type: [GroupAssignment] })
  readonly data: GroupAssignment[];
}
