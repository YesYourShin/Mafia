<<<<<<< HEAD
import { Inject, Injectable, Logger } from '@nestjs/common';
import { userInfo } from 'os';
import { GAME } from '../gateway/game-room/constants';
=======
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../user/profile.repository';
>>>>>>> 72180e2931abdd3f1b1c14071cdfb4ae1a404459
import { GameRepository } from './game.repository';

@Injectable()
export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}
<<<<<<< HEAD

  gameSave(UserProfile, roomId) {
    return this.gameRepository.save(UserProfile, roomId);
  }
}
// 여기서 정보 저장 & 레파지토리 생성해서 db 저장
=======
  async findAll(nickname: string, page: number, item: number) {
    //   이 닉네임을 가지고 있는 유저가 존재하는지 파악을 해야한다.
    const userId = await this.gameRepository.findOne(nickname);

    if (!userId) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return await this.gameRepository.findAll(userId, page, item);
  }
}
>>>>>>> 72180e2931abdd3f1b1c14071cdfb4ae1a404459
