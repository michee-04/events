import { ErrorDetail, ErrorResult, StringUtils } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    type: String,
    description: "Le prénom de l'utilisateur",
    example: 'John',
  })
  firstname: string;

  @ApiProperty({
    type: String,
    description: "Le nom de famille de l'utilisateur",
    example: 'Doe',
  })
  lastname: string;

  @ApiProperty({
    type: String,
    description: "Le sexe de l'utilisateur",
    enum: ['M', 'F'],
    example: 'M',
  })
  gender: string;

  @ApiProperty({
    type: String,
    format: 'email',
    description: "L'adresse e-mail de l'utilisateur",
    example: 'john.doe@mail.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: "Le numéro de téléphone de l'utilisateur",
    example: '+22899223344',
  })
  phone: string;

  @ApiProperty({
    type: String,
    description: "Le mot de passe de l'utilisateur",
    example: 'strong@Password123',
  })
  password: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.firstname = input.firstname;
    this.lastname = input.lastname;
    this.gender = input.gender;
    this.email = input.email;
    this.phone = input.phone;
    this.password = input.password;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.firstname) {
      errors.push({
        code: 400_039,
        clean_message: 'Le prénom est obligatoire',
        message: 'Le champ [firstname] est obligatoire',
      });
    }

    if (!input.lastname) {
      errors.push({
        code: 400_339,
        clean_message: 'Le nom est obligatoire',
        message: 'Le champ [lastname] est obligatoire',
      });
    }

    if (!input.gender) {
      errors.push({
        code: 400_040,
        clean_message: 'Le sexe est obligatoire',
        message: 'Le champ [gender] est obligatoire',
      });
    } else if (!['M', 'F'].includes(input.gender)) {
      // Check gender Male (M), Female (F)
      errors.push({
        code: 400_041,
        clean_message: 'Le sexe est invalide : Masculin ou Féminin',
        message: "Le champ [gender] doit avoir pour valeur 'M' ou 'F'",
      });
    }

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
