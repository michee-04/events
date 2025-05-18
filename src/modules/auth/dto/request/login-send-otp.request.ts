import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class LoginSendOtpDto {
  @ApiProperty({
    type: String,
    description: 'Le token de validation de connexion',
    example:
      'd33w9pawdt6pvhtwyv03hw35j6xk4ww0dhb8ybdw1yl72o5lm1f84bbyvju6rwmhivsu6jhiulbnnwkmz9lw3puuyuk2xlpas7qh',
  })
  token: string;

  @ApiProperty({
    type: String,
    description: "Le cannal d'envoi du code de vérification",
    enum: ['sms', 'email'],
    example: 'email',
    required: false,
  })
  channel: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.token = input.token;
    this.channel = input.channel;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.token) {
      errors.push({
        code: 400_038,
        clean_message: 'Le token est obligatoire',
        message: 'Le champ [token] est obligatoire',
      });
    }

    // if (!input.channel) {
    //   errors.push({
    //     code: 400_048,
    //     clean_message: 'Le canal est obligatoire',
    //     message: 'Le champ [channel] est obligatoire',
    //   });
    // } else if (!['sms', 'email'].includes(input.channel)) {
    //   errors.push({
    //     code: 400_049,
    //     clean_message: 'Le canal est invalide : sms ou email',
    //     message: "Le champ [channel] doit avoir pour valeur 'sms' ou 'email'",
    //   });
    // }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
