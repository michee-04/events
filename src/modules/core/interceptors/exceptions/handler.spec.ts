import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { TokenExpiredError } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { StatusCode } from '../../http/response';
import { WinstonLogger } from '../../services/logger/winston';
import { ExpectionHandlerFilter } from './handler';

describe('ExpectionHandler', () => {
  let exceptionHandler: ExpectionHandlerFilter;

  const mockSetStatus = jest.fn(() => ({ json: mockSetJson }));
  const mockSetJson = jest.fn();
  const mockAppendHeader = jest.fn();
  const mockServiceConfig = jest.fn();

  const hostMock: ArgumentsHost = {
    switchToHttp: () =>
      ({
        getResponse: () =>
          ({
            appendHeader: mockAppendHeader,
            status: mockSetStatus,
          }) as any,
        getRequest: () => ({ url: 'test' }),
      }) as HttpArgumentsHost,
    getArgs: () => ({}) as any,
    getArgByIndex: () => ({}) as any,
    switchToRpc: () => ({}) as any,
    switchToWs: () => ({}) as any,
    getType: () => ({}) as any,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ExpectionHandlerFilter,
        {
          provide: ConfigService,
          useValue: { getOrThrow: mockServiceConfig },
        },
        { provide: WinstonLogger, useValue: { error: jest.fn() } },
      ],
    }).compile();

    exceptionHandler = module.get(ExpectionHandlerFilter);
    // TODO: pay attention to this mock, we do not have nodeEnv yet
    // we process.env
    mockServiceConfig.mockReturnValue({ nodeEnv: 'development' });
  });

  it('should set token expired data on TokenExpiredError', () => {
    const exception = new TokenExpiredError('Token is expired', new Date());
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.INVALID_ACCESS_TOKEN,
      message: 'Token Expired',
      url: 'test',
    });

    expect(mockAppendHeader).toHaveBeenCalledWith(
      'instruction',
      'refresh_token',
    );
    expect(exceptionHandler['logger'].error).not.toHaveBeenCalled();
  });

  it('should set logout instruction data on invalid access token UnauthorizedException', () => {
    const exception = new UnauthorizedException('Invalid Access Token');
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.INVALID_ACCESS_TOKEN,
      message: 'Invalid Access Token',
      url: 'test',
    });

    expect(mockAppendHeader).toHaveBeenCalledWith('instruction', 'logout');
    expect(exceptionHandler['logger'].error).not.toHaveBeenCalled();
  });

  it('should set bad request data on BadRequestException', () => {
    const exception = new BadRequestException('Bad Request');
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.FAILURE,
      message: 'Bad Request',
      url: 'test',
    });

    expect(mockAppendHeader).not.toHaveBeenCalled();
    expect(exceptionHandler['logger'].error).not.toHaveBeenCalled();
  });

  it('should set internal error data on InternalServerErrorException', () => {
    const exception = new InternalServerErrorException('Something went wrong');
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.FAILURE,
      message: 'Something went wrong',
      url: 'test',
    });

    expect(mockAppendHeader).not.toHaveBeenCalled();
    expect(exceptionHandler['logger'].error).toHaveBeenCalled();
  });

  it('should log non http expections', () => {
    const exception = new Error('Other Error');
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.FAILURE,
      message: 'Other Error',
      url: 'test',
    });

    expect(mockAppendHeader).not.toHaveBeenCalled();
    expect(exceptionHandler['logger'].error).toHaveBeenCalled();
  });

  it('should not send actual error on production', () => {
    mockServiceConfig.mockReturnValue({ nodeEnv: 'production' });
    const exception = new Error('Other Error');
    exceptionHandler.catch(exception, hostMock);

    expect(mockSetStatus).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    expect(mockSetJson).toHaveBeenCalledWith({
      statusCode: StatusCode.FAILURE,
      message: 'Something went wrong',
      url: 'test',
    });

    expect(mockAppendHeader).not.toHaveBeenCalled();
    expect(exceptionHandler['logger'].error).toHaveBeenCalled();
  });
});
