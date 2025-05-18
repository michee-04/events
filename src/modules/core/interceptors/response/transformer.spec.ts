import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import {
  HttpDataResponse,
  HttpMessageResponse,
  StatusCode,
} from '../../http/response';
import { ResponseTransformerInterceptor } from './transformer';

describe('ResponseTransformerInterceptor', () => {
  let interceptor: ResponseTransformerInterceptor;
  let context: ExecutionContext;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new ResponseTransformerInterceptor();
    context = {} as ExecutionContext;
    next = {
      handle: jest.fn(),
    } as CallHandler;
  });
  it('should transform MessageResponse', async () => {
    const messageResponse = new HttpMessageResponse(
      StatusCode.SUCCESS,
      'Hello',
    );
    jest.spyOn(next, 'handle').mockReturnValue(of(messageResponse));

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toBe(messageResponse);
  });

  it('should transform DataResponse', async () => {
    const dataResponse = new HttpDataResponse(StatusCode.SUCCESS, 'success', {
      key: 'value',
    });
    jest.spyOn(next, 'handle').mockReturnValue(of(dataResponse));

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toBe(dataResponse);
  });

  it('should transform string to MessageResponse', async () => {
    const plainString = 'Hello, world!';
    jest.spyOn(next, 'handle').mockReturnValue(of(plainString));

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual(
      new HttpMessageResponse(StatusCode.SUCCESS, plainString),
    );
  });

  it('should transform other types to DataResponse', async () => {
    const complexObject = { key: 'value' };
    jest.spyOn(next, 'handle').mockReturnValue(of(complexObject));

    const result = await lastValueFrom(interceptor.intercept(context, next));

    expect(result).toEqual(
      new HttpDataResponse(StatusCode.SUCCESS, 'success', complexObject),
    );
  });
});
