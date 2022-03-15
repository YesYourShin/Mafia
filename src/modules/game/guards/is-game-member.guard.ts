import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserProfile } from 'src/modules/user/dto';
import { UserProfileInGame } from '../dto';
import { GameService } from '../game.service';

@Injectable()
export class IsGameMemberGuard implements CanActivate {
  constructor(private readonly gameService: GameService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const { profile } = request.user as UserProfile;
    const { userId } = profile;
    const { gameNumber } = request.params;

    const members: UserProfileInGame[] = await this.gameService.findMembers(
      +gameNumber,
    );
    const isMember = this.gameService.isMember(members, userId);
    if (isMember) {
      throw new ForbiddenException('게임 참여할 권한이 없습니다');
    }
    return true;
  }
}
