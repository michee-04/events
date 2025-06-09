import { StringUtils } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';
import { ApiStatus } from 'src/modules/core/http';

export class LoginWithOtpData {
  @ApiProperty({
    description: 'Le token de validation de connexion',
    example:
      'd33w9pawdt6pvhtwyv03hw35j6xk4ww0dhb8ybdw1yl72o5lm1f84bbyvju6rwmhivsu6jhiulbnnwkmz9lw3puuyuk2xlpas7qh',
  })
  readonly token: string;

  @ApiProperty({
    description: "La date d'expiration du token de validation de connexion",
    example: '2025-02-18T09:06:53.854Z',
  })
  readonly exp: Date;

  @ApiProperty({
    description: "Un aperçu de l'adresse e-mail de l'utilisateur",
    example: 'xi*****@lxheir.com',
  })
  readonly email: string;

  @ApiProperty({
    description: "Un aperçu du numéro de téléphone de l'utilisateur",
    example: '+22804****33',
  })
  readonly phone: string;

  constructor(input: LoginWithOtpData) {
    this.token = input.token;
    this.exp = input.exp;
    this.email = StringUtils.maskEmail(input.email);
    this.phone = StringUtils.maskPhone(input.phone);
  }
}

export class LoginWithOtpResponse {
  @ApiProperty({ example: ApiStatus.SUCCESS })
  readonly status: string;

  @ApiProperty()
  readonly data: LoginWithOtpData;
}
