import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import {
  GameInfo,
  GameInfoWithGameMembers,
  GameInfoWithMemberCount,
  UserProfileInGame,
} from './dto';
import IORedis from 'ioredis';
import { GamePrefix } from './constants/prefix';

export type Ok = 'OK';

@Injectable()
export class GameService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @InjectRedis('game') private readonly redis: Redis,
  ) {}

  async create(
    createGameDto: CreateGameDto,
    profile: UserProfileInGame,
  ): Promise<GameInfoWithGameMembers> {
    const gameNumber: number = await this.getGameIdOnToday();
    createGameDto.gameNumber = gameNumber;
    await this.saveGameInfo(gameNumber, createGameDto);
    return await this.join(gameNumber, profile);
  }

  async join(
    gameNumber: number,
    profile: UserProfileInGame,
  ): Promise<GameInfoWithGameMembers> {
    await this.addUserInGame(gameNumber, profile);
    return await this.mergeGameInfoAndMembers(gameNumber);
  }

  async mergeGameInfoAndMembers(
    gameNumber: number,
  ): Promise<GameInfoWithGameMembers> {
    const gameInfo: GameInfoWithGameMembers = await this.findGameInfo(
      this.getKeyOfSavedGameInfo(gameNumber),
    );
    gameInfo.members = await this.findUsersInGameRoom(gameNumber);
    return gameInfo;
  }

  async saveGameInfo(
    gameNumber: number,
    createGameDto: CreateGameDto,
  ): Promise<Ok | null> {
    return await this.redis.set(
      this.getKeyOfSavedGameInfo(gameNumber),
      JSON.stringify(createGameDto),
    );
  }

  async addUserInGame(
    gameNumber: number,
    profile: UserProfileInGame,
  ): Promise<number> {
    return await this.redis.rpush(
      this.getKeyOfSavedUserInfoInGame(gameNumber),
      JSON.stringify(profile),
    );
  }

  async findUsersInGameRoom(gameNumber: number): Promise<UserProfileInGame[]> {
    return (
      await this.redis.lrange(
        this.getKeyOfSavedUserInfoInGame(gameNumber),
        0,
        9,
      )
    ).map((member) => JSON.parse(member));
  }

  async findAll(): Promise<GameInfoWithMemberCount[]> {
    const gameKeys: IORedis.KeyType[] = await this.findAllGameKeys();
    return await this.findAllGameInfo(gameKeys);
  }

  async findGameInfo(gameKey: IORedis.KeyType): Promise<GameInfo> {
    return JSON.parse(await this.redis.get(gameKey));
  }

  async findAllGameInfo(
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
    return await this.redis.llen(this.getKeyOfSavedUserInfoInGame(gameNumber));
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

  async leaveInGameRoom(
    gameNumber: number,
    profile: UserProfileInGame,
  ): Promise<object> {
    if (await this.isLastMember(gameNumber)) {
      return await this.removeGameRoom(gameNumber);
    }
    await this.redis.lrem(
      this.getKeyOfSavedUserInfoInGame(gameNumber),
      1,
      JSON.stringify(profile),
    );
    return { userId: profile.userId, exit: true };
  }
  async removeGameRoom(gameNumber: number): Promise<object> {
    //del -> unlink로 바꿔야함 window redis version때문에 어쩔 수 없음
    await this.redis.del(
      this.getKeyOfSavedGameInfo(gameNumber),
      this.getKeyOfSavedUserInfoInGame(gameNumber),
    );
    return { gameNumber, delete: true };
  }
  async getGameIdOnToday(): Promise<number> {
    return await this.redis.incr(GamePrefix.gameNumber);
  }

  getKeyOfSavedGameInfo(gameNumber: number): IORedis.KeyType {
    return `${GamePrefix.gameInfo}${gameNumber}`;
  }

  getKeyOfSavedUserInfoInGame(gameNumber: number): IORedis.KeyType {
    return `${GamePrefix.gameMembers}${gameNumber}`;
  }
}
