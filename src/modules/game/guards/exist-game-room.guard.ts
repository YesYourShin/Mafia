import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { GameInfo } from '../dto';
import { GameService } from '../game.service';

@Injectable()
export class ExistGameRoomGuard implements CanActivate {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly gameService: GameService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const { gameNumber } = request.params;
    const game: GameInfo = await this.gameService.findGameInfo(
      this.gameService.getKeyOfSavedGameInfo(+gameNumber),
    );
    if (!game) throw new NotFoundException('존재하지 않는 게임 방입니다');
    return true;
  }
}
