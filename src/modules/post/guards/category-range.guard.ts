import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CategoryRangeGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const { category } = request.query;
    console.log('category', category);
    if (+category > 5 || +category < 1) {
      throw new NotFoundException('존재하지 않는 카테고리입니다');
    }
    return true;
  }
}
