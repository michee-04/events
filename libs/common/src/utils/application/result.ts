import { ErrorDetail } from '../domain';

export class ErrorResponse {
  statusCode: number;
  errors: ErrorDetail[];

  constructor(error: any) {
    this.statusCode = this.getStatusCode(error);
    this.errors = this.getErrors(error);
  }

  private getStatusCode(error: any) {
    if (this.isInvalidJsonBodyError(error)) {
      return 422;
    }

    if (this.isMongoIdCastError(error)) {
      return 400;
    }

    if (this.isInvalidErrorCode(error.code)) {
      return 500;
    }

    const firstThreeDigits = (error.code as number).toString().substring(0, 3);
    return Number(firstThreeDigits);
  }

  private getErrors(error: any): ErrorDetail[] {
    const errors: ErrorDetail[] = [];

    if (error.details && Array.isArray(error.details)) {
      error.details.forEach((e: any) => {
        errors.push(this.getSingleError({ ...e }));
      });
    } else {
      errors.push(this.getSingleError(error));
    }

    return errors;
  }

  private getSingleError(error: any): ErrorDetail {
    if (this.isInvalidJsonBodyError(error)) {
      return {
        code: 422_000,
        clean_message: 'Les données envoyées sont malformées',
        message: 'Les données envoyées sont malformées',
      };
    }

    if (this.isMongoIdCastError(error)) {
      return {
        code: 400_330,
        clean_message: "L'id est invalide",
        message: `L'id est invalide : ${error.value}`,
      };
    }

    if (this.isInvalidErrorCode(error.code)) {
      Object.assign(error, { code: 500_000 });
    }

    return {
      code: error.code as number,
      clean_message:
        error.clean_message ??
        'Une erreur est survenue. Veuillez réessayer plus tard',
      message: error.message ?? 'Une erreur est survenue',
    };
  }

  private isInvalidJsonBodyError(err: any) {
    return err instanceof SyntaxError;
  }

  private isMongoIdCastError(err: any) {
    return err.name === 'CastError';
  }

  private isInvalidErrorCode(code: any): code is number {
    return typeof code !== 'number' || code < 400_000 || code >= 600_000;
  }
}
