import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameEventService } from '../game-room/game-event.service';

@Injectable()
export class GamePlayerGuard implements CanActivate {
  constructor(private readonly gameEventService: GameEventService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { roomId } = context.switchToWs().getData();
    const { user } = context.switchToWs().getClient().request;

    const players = await this.gameEventService.findPlayers(roomId);

    for (const player of players) {
      if (player.userId === user.id) {
        return true;
      }
    }
    throw new WsException('게임에 참여할 권한이 없습니다');
  }
}
