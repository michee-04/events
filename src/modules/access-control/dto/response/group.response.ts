import { Group } from '@app/user-access-control/infrastructure/models/group';
import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from 'src/modules/core/http';

export class GroupResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty({ type: Group })
  readonly data: Group;
}

export class ListGroupsResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty({ type: [Group] })
  readonly data: Group[];
}
