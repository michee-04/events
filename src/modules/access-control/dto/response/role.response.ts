import { Role } from '@app/user-access-control/infrastructure/models/role';
import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from 'src/modules/core/http';

export class RoleResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty({ type: Role })
  readonly data: Role;
}

export class ListRolesResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty({ type: [Role] })
  readonly data: Role[];
}
