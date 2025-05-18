import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertEmailTemplateDto {
  @ApiProperty({
    type: String,
    description: "Le libellé du modèle d'email",
    example: "Mail pour OTP d'authentification",
  })
  label: string;

  @ApiProperty({
    type: String,
    description: "La description du modèle d'email",
    example: "Mail pour OTP d'authentification",
  })
  description: string;

  @ApiProperty({
    type: String,
    description: "L'objet de la notificaton mail",
    example: 'Code de vérification pour accéder à CHAT ANONYMOUS',
  })
  subject: string;

  @ApiProperty({
    type: String,
    description: 'Le message texte de la notificaton mail',
    example:
      'Votre code de vérification pour accéder à CHAT ANONYMOUS est : 000.',
  })
  message: string;

  @ApiProperty({
    type: String,
    description: 'Le modèle (HTML) de la notification mail',
    example:
      '<p>Votre code de vérification pour accéder à CHAT ANONYMOUS est : 000.</p>',
  })
  template: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.label = input.label;
    this.description = input.description;
    this.subject = input.subject;
    this.message = input.message;
    this.template = input.template;
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

    if (!input.template) {
      errors.push({
        code: 400_004,
        clean_message: 'Le modèle est obligatoire',
        message: 'Le champ [template] est obligatoire',
      });
    }

    if (!input.subject) {
      errors.push({
        code: 400_005,
        clean_message: "L'objet est obligatoire",
        message: 'Le champ [subject] est obligatoire',
      });
    }

    if (!input.message) {
      errors.push({
        code: 400_006,
        clean_message: 'Le message est obligatoire',
        message: 'Le champ [message] est obligatoire',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
