import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    type: String,
    description: "Le token de vérification de l'adresse e-mail",
    example: 'A4ENLY2NH4P5ZEVZRWOR0GTMGH9X5AH3NDOY92NQZ9UBQSFTHNDHNI',
  })
  token: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.token = input.token;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.token) {
      throw new ErrorResult({
        code: 400_038,
        clean_message: 'Le token est obligatoire',
        message: 'Le paramètre de requête [token] est obligatoire',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
