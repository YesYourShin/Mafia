import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { GameRoomEventService } from 'src/modules/gateway/game-room/game-room-event.service';
import { GameRoom } from '../dto';

@Injectable()
export class ExistGameRoomGuard implements CanActivate {
  constructor(private readonly gameRoomEventService: GameRoomEventService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { roomId } = request.params;
    const game: GameRoom = await this.gameRoomEventService.findOneOfRoomInfo(
      +roomId,
    );
    if (!game) throw new NotFoundException('존재하지 않는 게임 방입니다');
    return true;
  }
}
