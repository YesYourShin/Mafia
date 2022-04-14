import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RequestUser } from 'src/common/constants/request-user';
import { GameRoomEventService } from 'src/modules/gateway/game-room/game-room-event.service';
import { Member } from '../dto';

@Injectable()
export class IsGameRoomMemberGuard implements CanActivate {
  constructor(private readonly gameRoomEventService: GameRoomEventService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();

    const { userId } = request.user.profile;
    const { roomId } = request.params;

    const members: Member[] =
      await this.gameRoomEventService.findMembersByRoomId(+roomId);
    const isMember = this.gameRoomEventService.getMemberInGameRoomMember(
      members,
      userId,
    );
    if (isMember) {
      throw new ForbiddenException('게임 참여할 권한이 없습니다');
    }
    return true;
  }
}
