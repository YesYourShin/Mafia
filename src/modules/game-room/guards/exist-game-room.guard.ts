import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { GameRoomInfo } from '../dto';
import { GameRoomService } from '../game-room.service';

@Injectable()
export class ExistGameRoomGuard implements CanActivate {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly gameRoomService: GameRoomService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { gameRoomNumber } = request.params;
    const game: GameRoomInfo = await this.gameRoomService.findGameInfo(
      this.gameRoomService.getKeyOfSavedGameInfo(+gameRoomNumber),
    );
    if (!game) throw new NotFoundException('존재하지 않는 게임 방입니다');
    return true;
  }
}
