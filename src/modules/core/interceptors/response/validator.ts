// response-validation.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ValidationError, validateSync } from 'class-validator';

@Injectable()
export class ResponseValidationInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof Object) {
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

  // TODO: [IMPORTANT] find a way to avoid recursion here
  private extractErrorMessages(
    errors: ValidationError[],
    messages: string[] = [],
  ): string[] {
    for (const error of errors) {
      if (error) {
        if (error.children && error.children.length > 0)
          this.extractErrorMessages(error.children, messages);
        const constraints = error.constraints;
        if (constraints) messages.push(Object.values(constraints).join(', '));
      }
    }
    return messages;
  }
}
