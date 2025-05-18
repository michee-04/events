import { ErrorDetail, ErrorResult, StringUtils } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class LoginValidateOtpDto {
  @ApiProperty({
    type: String,
    description: 'Le token de validation de connexion',
    example:
      'd33w9pawdt6pvhtwyv03hw35j6xk4ww0dhb8ybdw1yl72o5lm1f84bbyvju6rwmhivsu6jhiulbnnwkmz9lw3puuyuk2xlpas7qh',
  })
  token: string;

  @ApiProperty({
    type: String,
    description: 'Le code de vérification',
    example: '345678',
  })
  otp: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.token = input.token;
    this.otp = input.otp;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.otp) {
      errors.push({
        code: 400_050,
        clean_message: 'Le code de vérification est obligatoire',
        message: 'Le champ [otp] est obligatoire',
      });
    } else if (!StringUtils.isOtp(input.otp)) {
      errors.push({
        code: 400_051,
        clean_message: 'Le code de vérification doit contenir 6 chiffres',
        message: 'Le champ [otp] doit contenir 6 chiffres',
      });
    }

    if (!input.token) {
      errors.push({
        code: 400_038,
        clean_message: 'Le token est obligatoire',
        message: 'Le champ [token] est obligatoire',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
