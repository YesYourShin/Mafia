import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserProfile } from 'src/modules/user/dto';

@Injectable()
export class ExistedProfileGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const { profile } = request.user as UserProfile;
    if (!profile) throw new ForbiddenException('프로필을 설정해야합니다');
    return true;
  }
}
