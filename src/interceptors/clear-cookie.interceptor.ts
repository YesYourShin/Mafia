import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ClearCookieInterceptor implements NestInterceptor {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next
      .handle()
      .pipe(tap(() => request.session.destroy((err) => {})))
      .pipe(tap(() => response.clearCookie('connect.sid', { httpOnly: true })));
  }
}
