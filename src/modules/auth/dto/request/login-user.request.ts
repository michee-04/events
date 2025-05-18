import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    type: String,
    description: "Le nom d'utilisateur ou l'adresse e-mail de l'utilisateur",
    example: 'johndoe@mail.com',
  })
  username: string;

  @ApiProperty({
    type: String,
    description: "Le mot de passe de l'utilisateur",
    example: 'strong@Password123',
  })
  password: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.username = input.username;
    this.password = input.password;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.username) {
      errors.push({
        code: 400_047,
        clean_message: "Le nom d'utilisateur est obligatoire",
        message: 'Le champ [username] est obligatoire',
      });
    }

    if (!input.password) {
      errors.push({
        code: 400_045,
        clean_message: 'Le mot de passe est obligatoire',
        message: 'Le champ [password] est obligatoire',
      });
    } else if (typeof input.password !== 'string') {
      errors.push({
        code: 400_046,
        clean_message: 'Le mot de passe est invalide',
        message: 'Le champ [password] est invalide',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
