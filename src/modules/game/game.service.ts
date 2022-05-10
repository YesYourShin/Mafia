import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../user/profile.repository';
import { GameRepository } from './game.repository';

@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository, // private readonly profileRepository: ProfileRepository,
  ) {}
  async findAll(nickname: string, page: number, item: number) {
    //   이 닉네임을 가지고 있는 유저가 존재하는지 파악을 해야한다.
    const profile = this.gameRepository.findOne(nickname);
    if (!profile) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    // item;

    // return await this.gameRepository.findAll(nickname, item, (page - 1) * item);
    return profile;
  }

  //   async findOne(id: number) {
  //     return await this.gameRepository.findOne(id);
  //   }
}
