import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameRoomEventService } from '../game-room/game-room-event.service';

@Injectable()
export class RoomLimitationGuard implements CanActivate {
  constructor(private readonly gameRoomEventService: GameRoomEventService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { gameRoomNumber } = context.switchToWs().getData();
    const count = await this.gameRoomEventService.countUsersInGame(
      gameRoomNumber,
    );
    const gameInfo = await this.gameRoomEventService.findGameInfo(
      this.gameRoomEventService.getKeyOfSavedGameInfo(gameRoomNumber),
    );
    console.log('count', count);
    console.log('gameInfo', gameInfo);
    if (gameInfo.limit <= count) {
      throw new WsException('방이 꽉 찼습니다');
    }
    return true;
  }
}
