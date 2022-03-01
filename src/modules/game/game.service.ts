import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import {
  GameInfo,
  GameInfoWithGameMembers,
  GameInfoWithMemberCount,
  UserProfileInGame,
} from './dto';
import { validate } from 'class-validator';
import IORedis from 'ioredis';

dayjs.locale('ko');

export type Ok = 'OK';

@Injectable()
export class GameService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async create(
    createGameDto: CreateGameDto,
    profile: UserProfileInGame,
  ): Promise<GameInfoWithGameMembers> {
    validate(createGameDto).then((errors) => {
      if (errors.length > 0) {
        this.logger.error(errors);
      } else {
        this.logger.log('validation succeed');
      }
    });
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
      this.getKeyOfsavedGameInfo(gameNumber),
    );
    gameInfo.members = await this.findUsersInGameRoom(gameNumber);
    return gameInfo;
  }

  async saveGameInfo(
    gameNumber: number,
    createGameDto: CreateGameDto,
  ): Promise<Ok | null> {
    return await this.redis.set(
      this.getKeyOfsavedGameInfo(gameNumber),
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
    return await this.redis.keys('game:info#*');
  }
  isMember(
    members: UserProfileInGame[],
    userId: UserProfileInGame['userId'],
  ): boolean {
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
    await this.redis.unlink(
      this.getKeyOfsavedGameInfo(gameNumber),
      this.getKeyOfSavedUserInfoInGame(gameNumber),
    );
    return { gameNumber, delete: true };
  }

  async getGameIdOnToday(): Promise<number> {
    return await this.redis.incr(
      `game:${dayjs(Date.now()).format('YYYYMMDD')}`,
    );
  }

  getKeyOfsavedGameInfo(gameNumber: number): IORedis.KeyType {
    return `game:info#${gameNumber}`;
  }

  getKeyOfSavedUserInfoInGame(gameNumber: number): IORedis.KeyType {
    return `game:users#${gameNumber}`;
  }
}
