import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RequestUser } from 'src/common/constants/request-user';
import { Member } from '../dto';
import { GameRoomService } from '../game-room.service';

@Injectable()
export class IsGameRoomMemberGuard implements CanActivate {
  constructor(private readonly gameRoomService: GameRoomService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();

    const { userId } = request.user.profile;
    const { gameRoomNumber } = request.params;

    const members: Member[] = await this.gameRoomService.findMembers(
      +gameRoomNumber,
    );
    const isMember = this.gameRoomService.isMember(members, userId);
    if (isMember) {
      throw new ForbiddenException('게임 참여할 권한이 없습니다');
    }
    return true;
  }
}
