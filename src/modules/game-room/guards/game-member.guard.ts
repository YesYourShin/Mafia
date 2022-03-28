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
export class GameMemberGuard implements CanActivate {
  constructor(private readonly gameRoomEventService: GameRoomEventService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();

    const { userId } = request.user.profile;
    const { gameRoomNumber } = request.params;

    const members: Member[] =
      await this.gameRoomEventService.findAllMemberByGameRoomNumber(
        +gameRoomNumber,
      );
    const isMember = this.gameRoomEventService.getMemberInGameRoomMember(
      members,
      userId,
    );
    if (!isMember) {
      throw new ForbiddenException('게임 방 멤버가 아닙니다');
    }
    return true;
  }
}
