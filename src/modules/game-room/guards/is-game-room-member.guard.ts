import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserProfile } from 'src/modules/user/dto';
import { UserProfileInGame } from '../dto';
import { GameRoomService } from '../game-room.service';

@Injectable()
export class IsGameRoomMemberGuard implements CanActivate {
  constructor(private readonly gameRoomService: GameRoomService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const { profile } = request.user as UserProfile;
    const { userId } = profile;
    const { gameNumber } = request.params;

    const members: UserProfileInGame[] = await this.gameRoomService.findMembers(
      +gameNumber,
    );
    const isMember = this.gameRoomService.isMember(members, userId);
    if (isMember) {
      throw new ForbiddenException('게임 참여할 권한이 없습니다');
    }
    return true;
  }
}
