import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import {
  ValidationError,
  getMetadataStorage,
  validateSync,
} from 'class-validator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseValidationInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (this.shouldValidate(data)) {
          const errors = validateSync(data);
          if (errors.length > 0) {
            const messages = this.extractErrorMessages(errors);
            throw new InternalServerErrorException([
              'Response validation failed',
              ...messages,
            ]);
          }
        }
        return data;
      }),
    );
  }

  private shouldValidate(data: any): boolean {
    if (!(data instanceof Object)) return false;

    const metadataStorage = getMetadataStorage();
    const metadatas = metadataStorage.getTargetValidationMetadatas(
      data.constructor,
      '',
      false,
      false,
    );
    return metadatas.length > 0;
  }

  private extractErrorMessages(
    errors: ValidationError[],
    messages: string[] = [],
  ): string[] {
    for (const error of errors) {
      if (error.children && error.children.length > 0) {
        this.extractErrorMessages(error.children, messages);
      }
      const constraints = error.constraints;
      if (constraints) {
        messages.push(...Object.values(constraints));
      }
    }
    return messages;
  }
}
