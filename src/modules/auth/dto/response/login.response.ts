import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from 'src/modules/core/http';

export class LoginData {
  @ApiProperty({
    description: "Le token d'accès",
    example: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9',
  })
  readonly access_token: string;

  @ApiProperty({
    description: "Le timestamp d'expiration du token d'accès",
    example: '1676296888',
  })
  readonly access_expires_at: number;

  @ApiProperty({
    description: 'Le token de rafraîchissement',
    example: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9',
  })
  readonly refresh_token: string;

  @ApiProperty({
    description: "Le timestamp d'expiration du token de rafraîchissement",
    example: '1676383288',
  })
  readonly refresh_expires_at: number;

  @ApiProperty({
    description: 'Le type des tokens',
    example: 'Bearer',
  })
  readonly token_type: string;

  @ApiProperty({
    description: 'La portée des tokens',
    example: 'authentication',
  })
  readonly scope: string;

  constructor(input: LoginData) {
    this.access_token = input.access_token;
    this.access_expires_at = input.access_expires_at;
    this.refresh_token = input.refresh_token;
    this.refresh_expires_at = input.refresh_expires_at;
    this.token_type = input.token_type;
    this.scope = input.scope;
  }
}

export class LoginResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty()
  readonly data: LoginData;
}
