import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class RecoverPasswordSendOtpDto {
  @ApiProperty({
    type: String,
    description: 'Le token de réinitialisation de mot de passe',
    example:
      'd33w9pawdt6pvhtwyv03hw35j6xk4ww0dhb8ybdw1yl72o5lm1f84bbyvju6rwmhivsu6jhiulbnnwkmz9lw3puuyuk2xlpas7qh',
  })
  token: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.token = input.token;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.token) {
      throw new ErrorResult({
        code: 400_038,
        clean_message: 'Le token est obligatoire',
        message: 'Le paramètre de requête [token] est obligatoire',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
