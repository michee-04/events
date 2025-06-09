import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class StripeSessionDto {
  @ApiProperty({
    type: String,
    description: 'Identifiant unique de la session Stripe (checkout)',
    example:
      'cs_test_a1N9DAIsnN5NFolabEfXEXJGZWKmpucNNxJOwGLpQKtID41UlPAf96QHS8',
  })
  sessionId: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.sessionId = input.sessionId;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.sessionId) {
      errors.push({
        code: 400_050,
        clean_message: 'La session Stripe est requise',
        message: 'Le champ [sessionId] est obligatoire',
      });
    } else if (typeof input.sessionId !== 'string') {
      errors.push({
        code: 400_051,
        clean_message: 'La session Stripe doit être une chaîne de caractères',
        message: 'Le champ [sessionId] doit être de type string',
      });
    } else if (!input.sessionId.startsWith('cs_test_')) {
      errors.push({
        code: 400_052,
        clean_message: 'La session Stripe est invalide',
        message:
          'Le champ [sessionId] ne correspond pas à un identifiant Stripe valide de test',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
