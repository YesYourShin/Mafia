import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestUser } from 'src/common/constants/request-user';

@Injectable()
export class MyProfileImageGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();
    const { key } = request.query;
    const { image } = request.user.profile;
    if (!image || image?.key !== key) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }
    return true;
  }
}
