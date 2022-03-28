import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameRoomEventService } from '../game-room/game-room-event.service';

@Injectable()
export class RoomLimitationGuard implements CanActivate {
  constructor(private readonly gameRoomEventService: GameRoomEventService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { gameRoomNumber } = context.switchToWs().getData();

    const members =
      await this.gameRoomEventService.findAllMemberByGameRoomNumber(
        gameRoomNumber,
      );

    const { limit } = await this.gameRoomEventService.findGameRoomInfo({
      gameRoomNumber,
    });

    if (limit <= members.length) {
      console.log(`limit: ${limit} / members.length: ${members.length}`);
      throw new WsException('방이 꽉 찼습니다');
    }
    return true;
  }
}
