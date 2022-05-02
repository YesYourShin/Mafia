import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameRoomEventService } from '../game-room/game-room-event.service';

@Injectable()
export class RoomLimitationGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => GameRoomEventService))
    private readonly gameRoomEventService: GameRoomEventService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { roomId } = context.switchToWs().getData();
    if (roomId === 0) {
      return true;
    }

    const members = await this.gameRoomEventService.findMembersByRoomId(roomId);

    const { publishers } = await this.gameRoomEventService.findOneOfRoomInfo(
      roomId,
    );

    if (publishers <= members.length) {
      console.log(
        `publishers: ${publishers} / members.length: ${members.length}`,
      );
      throw new WsException('방이 꽉 찼습니다');
    }
    return true;
  }
}
