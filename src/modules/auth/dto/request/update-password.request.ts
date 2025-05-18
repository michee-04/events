import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    type: String,
    description: "L'ancien mot de passe de l'utilisateur",
    example: 'old@Password123',
  })
  oldPassword: string;

  @ApiProperty({
    type: String,
    description: "Le nouveau mot de passe de l'utilisateur",
    example: 'new@Password123',
  })
  password: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.oldPassword = input.oldPassword;
    this.password = input.password;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.oldPassword) {
      errors.push({
        code: 400_052,
        clean_message: "L'ancien mot de passe est obligatoire",
        message: 'Le champ [oldPassword] est obligatoire',
      });
    }

    if (!input.password) {
      errors.push({
        code: 400_053,
        clean_message: 'Le nouveau mot de passe est obligatoire',
        message: 'Le champ [password] est obligatoire',
      });
    } else if (typeof input.password !== 'string') {
      errors.push({
        code: 400_054,
        clean_message: 'Le nouveau mot de passe est invalide',
        message: 'Le champ [password] est invalide',
      });
    }

    if (
      input.oldPassword &&
      input.password &&
      input.oldPassword === input.password
    ) {
      errors.push({
        code: 400_055,
        clean_message:
          "L'ancien et le nouveau mot de passe ne peuvent pas être identiques",
        message:
          'Les champs [oldPassword] et [password] ne peuvent pas être identiques',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
