import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../user/profile.repository';
import { GameRepository } from './game.repository';

@Injectable()
<<<<<<< HEAD
export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}
  async findAll(nickname: string, page: number, item: number) {
    //   이 닉네임을 가지고 있는 유저가 존재하는지 파악을 해야한다.
    const userId = await this.gameRepository.findOne(nickname);

    if (!userId) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    return await this.gameRepository.findAll(userId, page, item);
  }
}
=======
export class GameService {}
// 여기서 정보 저장 & 레파지토리 생성해서 db 저장
>>>>>>> fec25befe7f8016d8899dde361dd0d7f3a6203fb
