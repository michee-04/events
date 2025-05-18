import { ErrorDetail, ErrorResult, StringUtils } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class RecoverPasswordRequestDto {
  @ApiProperty({
    type: String,
    format: 'email',
    description: "L'adresse e-mail de l'utilisateur",
    example: 'john.doe@mail.com',
  })
  email: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.email = input.email;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.email) {
      errors.push({
        code: 400_037,
        clean_message: "L'adresse e-mail est obligatoire",
        message: 'Le champ [email] est obligatoire',
      });
    } else if (!StringUtils.isEmail(input.email)) {
      errors.push({
        code: 400_042,
        clean_message: "L'adresse e-mail est invalide",
        message: "Le champ [email] n'est pas une adresse e-mail valide",
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
