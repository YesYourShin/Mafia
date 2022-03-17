import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ValidateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const { limit } = request.body;
    if (limit < 5 || limit > 10) {
      throw new BadRequestException('잘못된 게임 최대 인원 수 설정');
    }
    return true;
  }
}
