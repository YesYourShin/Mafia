import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import {
  GameInfo,
  GameInfoWithMemberCount,
  UpdateGameDto,
  UserProfileInGame,
} from './dto';
import IORedis from 'ioredis';
import { GamePrefix } from './constants/prefix';
import { GameGateway } from '../event/game/game.gateway';
import { Event } from '../event/game/constants';
import { REDIS_GAME } from '../redis';

export type Ok = 'OK';

@Injectable()
export class GameService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @InjectRedis(REDIS_GAME) private readonly redis: Redis,
    private readonly gameGateway: GameGateway,
  ) {}

  async create(
    createGameDto: CreateGameDto,
    profile: UserProfileInGame,
  ): Promise<GameInfo> {
    const gameNumber: number = await this.getGameId();
    createGameDto.gameNumber = gameNumber;
    await this.saveGameInfo(createGameDto);
    await this.addUserInGame(gameNumber, profile);
    return await this.findGameInfo(this.getKeyOfSavedGameInfo(gameNumber));
  }

  async update(
    gameNumber: number,
    updateGameDto: UpdateGameDto,
    profile: UserProfileInGame,
  ) {
    const leader = await this.findMember(gameNumber, 0);
    if (leader.userId !== profile.userId) {
      throw new ForbiddenException('방 수정 권한이 없습니다');
    }
    updateGameDto.gameNumber = gameNumber;
    await this.saveGameInfo(updateGameDto);
    const gameInfo = await this.findGameInfo(
      this.getKeyOfSavedGameInfo(gameNumber),
    );
    this.gameGateway.server
      .to(`game-${gameNumber}`)
      .emit(Event.UPDATE, gameInfo);
    return { message: '방 정보가 수정 완료' };
  }

  async join(
    gameNumber: number,
    profile: UserProfileInGame,
  ): Promise<GameInfo> {
    await this.addUserInGame(gameNumber, profile);
    return await this.findGameInfo(this.getKeyOfSavedGameInfo(gameNumber));
  }

  // async mergeGameInfoAndMembers(
  //   gameNumber: number,
  // ): Promise<GameInfoWithGameMembers> {
  //   const gameInfo: GameInfoWithGameMembers = await this.findGameInfo(
  //     this.getKeyOfSavedGameInfo(gameNumber),
  //   );
  //   gameInfo.members = await this.findMembers(gameNumber);
  //   return gameInfo;
  // }

  async saveGameInfo(
    gameDto: CreateGameDto | UpdateGameDto,
  ): Promise<Ok | null> {
    return await this.redis.set(
      this.getKeyOfSavedGameInfo(gameDto.gameNumber),
      JSON.stringify(gameDto),
    );
  }

  async addUserInGame(
    gameNumber: number,
    profile: UserProfileInGame,
  ): Promise<number> {
    return await this.redis.rpush(
      this.getKeyOfSavedUserInfo(gameNumber),
      JSON.stringify(profile),
    );
  }
  async findMember(
    gameNumber: number,
    index: number,
  ): Promise<UserProfileInGame> {
    return JSON.parse(
      await this.redis.lindex(this.getKeyOfSavedUserInfo(gameNumber), index),
    );
  }

  async findMembers(gameNumber: number): Promise<UserProfileInGame[]> {
    return (
      await this.redis.lrange(this.getKeyOfSavedUserInfo(gameNumber), 0, 9)
    ).map((member) => JSON.parse(member));
  }

  async findAll(): Promise<GameInfoWithMemberCount[]> {
    const gameKeys: IORedis.KeyType[] = await this.findAllGameKeys();
    return await this.findAllGame(gameKeys);
  }

  async findGameInfo(gameKey: IORedis.KeyType): Promise<GameInfo> {
    return JSON.parse(await this.redis.get(gameKey));
  }

  async findAllGame(
    gameKeys: IORedis.KeyType[],
  ): Promise<GameInfoWithMemberCount[]> {
    return await Promise.all(
      gameKeys.map(async (key: IORedis.KeyType) => {
        const game: GameInfoWithMemberCount = await this.findGameInfo(key);
        game.memberCount = await this.countUsersInGame(game.gameNumber);
        return game;
      }),
    );
  }

  async countUsersInGame(gameNumber: number): Promise<number> {
    return await this.redis.llen(this.getKeyOfSavedUserInfo(gameNumber));
  }

  async findAllGameKeys(): Promise<IORedis.KeyType[]> {
    return await this.redis.keys(`${GamePrefix.gameInfo}*`);
  }
  isMember(members: UserProfileInGame[], userId: number): boolean {
    for (const member of members) {
      if (member.userId === userId) return true;
    }
    return false;
  }
  async isLastMember(gameNumber: number): Promise<boolean> {
    const memberCount: number = await this.countUsersInGame(gameNumber);
    if (memberCount === 1) return true;
    return false;
  }
  async isFirstMember(game: number, profile: UserProfileInGame) {}

  async leave(gameNumber: number, profile: UserProfileInGame): Promise<object> {
    if (await this.isLastMember(gameNumber)) {
      return await this.remove(gameNumber);
    }
    await this.redis.lrem(
      this.getKeyOfSavedUserInfo(gameNumber),
      1,
      JSON.stringify(profile),
    );
    return { userId: profile.userId, exit: true };
  }
  async remove(gameNumber: number): Promise<object> {
    //del -> unlink로 바꿔야함 window redis version때문에 어쩔 수 없음
    await this.redis.del(
      this.getKeyOfSavedGameInfo(gameNumber),
      this.getKeyOfSavedUserInfo(gameNumber),
    );
    return { gameNumber, delete: true };
  }
  async getGameId(): Promise<number> {
    return await this.redis.incr(GamePrefix.gameNumber);
  }

  getKeyOfSavedGameInfo(gameNumber: number): IORedis.KeyType {
    return `${GamePrefix.gameInfo}${gameNumber}`;
  }

  getKeyOfSavedUserInfo(gameNumber: number): IORedis.KeyType {
    return `${GamePrefix.gameMembers}${gameNumber}`;
  }
}
