import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserProfile } from 'src/modules/user/dto';

@Injectable()
export class ExistFriendGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

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
