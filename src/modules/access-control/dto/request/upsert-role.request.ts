import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertRoleDto {
  @ApiProperty({
    type: String,
    description: 'Le libellé du rôle',
    example: "Rôle d'un utilisateur",
  })
  label: string;

  @ApiProperty({
    type: String,
    description: 'La description du rôle',
    example: "Rôle d'un utilisateur",
  })
  description: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.label = input.label;
    this.description = input.description;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.label) {
      errors.push({
        code: 400_001,
        clean_message: 'Le libellé est obligatoire',
        message: 'Le champ [label] est obligatoire',
      });
    }

    if (!input.description) {
      errors.push({
        code: 400_003,
        clean_message: 'La description est obligatoire',
        message: 'Le champ [description] est obligatoire',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
