import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserProfile } from 'src/modules/user/dto';

@Injectable()
export class ExistFriendGuard implements CanActivate {
  constructor() {}

  // Todo 아마도 친구 추가 후 friends 갱신 안됨
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { friendId } = request.params;
    const user = request.user as UserProfile;

    for (const friend of user.friends as any) {
      console.log(friend);
      if (friend.userId === +friendId) {
        return true;
      }
    }
    throw new ForbiddenException('존재하지 않는 친구입니다');
  }
}
