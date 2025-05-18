import { ErrorResponse, ErrorResult } from '@app/common/utils';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenExpiredError } from '@nestjs/jwt';
import { isArray } from 'class-validator';
import { Request, Response } from 'express';
import { StatusCode } from '../http';

@Catch()
export class ExpectionHandlerFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Handle Custom error here
    if (exception instanceof ErrorResponse) {
      return response.status(exception.statusCode).json({
        statusCode: StatusCode.FAILURE,
        message: 'Failure',
        errors: exception.errors,
        url: request.url,
      });
    }

    if (exception instanceof ErrorResult) {
      exception = new ErrorResponse(exception);
      return response.status(exception.statusCode).json({
        statusCode: StatusCode.FAILURE,
        message: 'Failure',
        errors: exception.errors,
        url: request.url,
      });
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let statusCode = StatusCode.FAILURE;
    let message: string = 'Something went wrong';
    let errors: any[] | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if ('message' in body) {
        if (typeof body.message === 'string') {
          message = body.message;
        } else if (isArray(body.message) && body.message.length > 0) {
          message = body.message[0];
          errors = body.message;
        }
      }

      if (exception instanceof InternalServerErrorException) {
        Logger.error(exception.message, exception.stack);
      }

      if (exception instanceof UnauthorizedException) {
        if (message.toLowerCase().includes('invalid access token')) {
          statusCode = StatusCode.INVALID_ACCESS_TOKEN;
          response.appendHeader('instruction', 'logout');
        }
      }
    } else if (exception instanceof TokenExpiredError) {
      status = HttpStatus.UNAUTHORIZED;
      statusCode = StatusCode.INVALID_ACCESS_TOKEN;
      response.appendHeader('instruction', 'refresh_token');
      message = 'Token Expired';
    } else {
      if (process.env.NODE_ENV === 'development') {
        message = exception.message;
      }
      Logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      statusCode: statusCode,
      message: message,
      errors: errors,
      url: request.url,
    });
  }
}
