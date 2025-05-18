import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import {
  HttpDataResponse,
  HttpMessageResponse,
  StatusCode,
} from '../../http/response';

// TODO: think where we can put the translation service
@Injectable()
export class ResponseTransformerInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof HttpMessageResponse) return data;
        if (data instanceof HttpDataResponse) return data;
        if (typeof data === 'string') {
          return new HttpMessageResponse(StatusCode.SUCCESS, data);
        }
        return new HttpDataResponse(StatusCode.SUCCESS, 'success', data);
      }),
    );
  }
}
