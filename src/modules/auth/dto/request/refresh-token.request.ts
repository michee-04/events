import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    type: String,
    description: 'Le token de rafraîchissement',
    example: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9',
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
