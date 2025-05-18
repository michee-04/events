import { User } from '@app/user-access-control/infrastructure/models/user';
import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from 'src/modules/core/http';

export class ProfileResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty()
  readonly data: User;
}
