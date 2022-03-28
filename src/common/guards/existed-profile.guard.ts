import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestUser } from '../constants/request-user';

@Injectable()
export class ExistedProfileGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();
    const { profile } = request.user;
    if (!profile) throw new ForbiddenException('프로필을 설정해야합니다');
    return true;
  }
}
