import { ErrorDetail, ErrorResult, ObjectUtils } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    type: String,
    description: "Le prénom de l'utilisateur",
    example: 'John',
    required: false,
  })
  firstname?: string;

  @ApiProperty({
    type: String,
    description: "Le nom de famille de l'utilisateur",
    example: 'Doe',
    required: false,
  })
  lastname?: string;

  @ApiProperty({
    type: String,
    description: "Le sexe de l'utilisateur",
    enum: ['M', 'F'],
    example: 'M',
    required: false,
  })
  gender?: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.firstname = input.firstname;
    this.lastname = input.lastname;
    this.gender = input.gender;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];
    if (
      ObjectUtils.hasProperty(input, 'firstname') &&
      !input.firstname?.toString().trim()
    ) {
      errors.push({
        code: 400_056,
        clean_message: 'Le prénom ne peut pas être vide',
        message: 'Le champ [firstname] ne peut pas être vide',
      });
    }

    if (
      ObjectUtils.hasProperty(input, 'lastname') &&
      !input.lastname?.toString().trim()
    ) {
      errors.push({
        code: 400_340,
        clean_message: 'Le nom ne peut pas être vide',
        message: 'Le champ [lastname] ne peut pas être vide',
      });
    }

    if (ObjectUtils.hasProperty(input, 'gender')) {
      if (!input.gender?.toString().trim()) {
        errors.push({
          code: 400_057,
          clean_message: 'Le sexe ne peut pas être vide',
          message: 'Le champ [gender] ne peut pas être vide',
        });
      } else if (!['M', 'F'].includes(input.gender)) {
        // Check gender Male (M), Female (F)
        errors.push({
          code: 400_041,
          clean_message: 'Le sexe est invalide : Masculin ou Féminin',
          message: "Le champ [gender] doit avoir pour valeur 'M' ou 'F'",
        });
      }
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
