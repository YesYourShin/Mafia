import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const status = context.switchToHttp().getResponse<Response>().statusCode;
    return next.handle().pipe(
      map((data) => ({
        success: true,
        status,
        data,
      })),
    );
  }
}
