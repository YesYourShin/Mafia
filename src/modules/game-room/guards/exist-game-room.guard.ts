import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { GameRoomEventService } from 'src/modules/gateway/game-room/game-room-event.service';
import { GameRoomInfo } from '../dto';

@Injectable()
export class ExistGameRoomGuard implements CanActivate {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly gameRoomEventService: GameRoomEventService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { gameRoomNumber } = request.params;
    const game: GameRoomInfo = await this.gameRoomEventService.findGameRoomInfo(
      { gameRoomNumber: +gameRoomNumber },
    );
    if (!game) throw new NotFoundException('존재하지 않는 게임 방입니다');
    return true;
  }
}
