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
export class GameMemberGuard implements CanActivate {
  constructor(private readonly gameRoomService: GameRoomService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const { profile } = request.user as UserProfile;
    const { userId } = profile;
    const { gameRoomNumber } = request.params;

    const members: UserProfileInGame[] = await this.gameRoomService.findMembers(
      +gameRoomNumber,
    );
    const isMember = this.gameRoomService.isMember(members, userId);
    if (!isMember) {
      throw new ForbiddenException('게임 방 멤버가 아닙니다');
    }
    return true;
  }
}
