import { Inject, Injectable, Logger } from '@nestjs/common';
import { userInfo } from 'os';
import { GAME } from '../gateway/game-room/constants';
import { GameRepository } from './game.repository';

@Injectable()
export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}

  gameSave(UserProfile, roomId) {
    return this.gameRepository.save(UserProfile, roomId);
  }
}
// 여기서 정보 저장 & 레파지토리 생성해서 db 저장
