import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (request.path.match(/\/api\/auth\/\w+\/login/)) {
      return response.redirect(process.env.FRONT_URL, 307);
    }

    const err = exception.getResponse() as
      | string
      | {
          error: string;
          statusCode: HttpStatus.BAD_REQUEST;
          message: string[];
        };

    if (typeof err !== 'string' && err.error === 'Bad Request') {
      return response.status(status).json({
        success: false,
        status,
        data: err.message,
      });
    }

    response.status(status).json({
      success: false,
      status,
      data: err,
    });
  }
}
