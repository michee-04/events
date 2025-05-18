import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from 'src/modules/core/http';

export class RecoverPasswordWithOtpData {
  @ApiProperty({
    description: 'Le token de soumission du code de vérification',
    example:
      'd33w9pawdt6pvhtwyv03hw35j6xk4ww0dhb8ybdw1yl72o5lm1f84bbyvju6rwmhivsu6jhiulbnnwkmz9lw3puuyuk2xlpas7qh',
  })
  readonly token: string;

  @ApiProperty({
    description: "La date d'expiration du code de vérification",
    example: '2025-02-18T09:06:53.854Z',
  })
  readonly exp: Date;

  constructor(input: RecoverPasswordWithOtpData) {
    this.token = input.token;
    this.exp = input.exp;
  }
}

export class RecoverPasswordWithOtpResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty()
  readonly data: RecoverPasswordWithOtpData;
}
