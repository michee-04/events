import {
  CallHandler,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import classValidator from 'class-validator';
import { lastValueFrom, Observable, of } from 'rxjs';
import { ResponseValidationInterceptor } from './validator';

class MockCallHandler implements CallHandler {
  handle(): Observable<any> {
    return of({});
  }
}

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validateSync: jest.fn(),
}));

describe('ResponseValidationInterceptor', () => {
  let interceptor: ResponseValidationInterceptor;
  const context = {} as ExecutionContext;
  const mockCallHandler = new MockCallHandler();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [ResponseValidationInterceptor],
    }).compile();

    interceptor = module.get(ResponseValidationInterceptor);
  });

  it('should not throw an exception for a valid response', async () => {
    jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of({}));

    (classValidator.validateSync as jest.Mock).mockReturnValue([]);

    await expect(
      lastValueFrom(interceptor.intercept(context, mockCallHandler)),
    ).resolves.not.toThrow();

    expect(classValidator.validateSync).toHaveBeenCalled();
  });

  it('should throw InternalServerErrorException for an invalid response', async () => {
    const validationError = {
      constraints: { exampleConstraint: 'Error message' },
    };

    jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of({}));

    (classValidator.validateSync as jest.Mock).mockReturnValue([
      validationError,
    ]);

    await expect(
      lastValueFrom(interceptor.intercept(context, mockCallHandler)),
    ).rejects.toThrow(InternalServerErrorException);

    expect(classValidator.validateSync).toHaveBeenCalled();
  });

  it('should extract error messages correctly', () => {
    const errors = [
      {
        property: 'property1',
        constraints: { exampleConstraint1: 'Error message 1' },
      } as classValidator.ValidationError,
      {
        property: 'property1',
        constraints: { exampleConstraint2: 'Error message 2' },
      } as classValidator.ValidationError,
    ];

    const result = interceptor['extractErrorMessages'](errors, []);

    expect(result).toEqual(['Error message 1', 'Error message 2']);
  });
});
