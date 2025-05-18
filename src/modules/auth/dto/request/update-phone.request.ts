import { ErrorDetail, ErrorResult, StringUtils } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePhoneDto {
  @ApiProperty({
    type: String,
    description: "Le numéro de téléphone de l'utilisateur",
    example: '+22899223344',
  })
  phone: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.phone = input.phone;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.phone) {
      errors.push({
        code: 400_043,
        clean_message: 'Le numéro de téléphone est obligatoire',
        message: 'Le champ [phone] est obligatoire',
      });
    } else if (
      typeof input.phone !== 'string' ||
      !StringUtils.isPhone(input.phone)
    ) {
      errors.push({
        code: 400_044,
        clean_message: 'Le numéro de téléphone est invalide',
        message: "Le champ [phone] n'est pas un numéro de téléphone valide",
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
