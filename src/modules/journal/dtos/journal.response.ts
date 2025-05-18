import { Journal } from '@app/journal/infrastructure/models/journal';
import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from 'src/modules/core/http';

export class ListJournalsResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty({ type: [Journal] })
  readonly data: Journal[];
}
