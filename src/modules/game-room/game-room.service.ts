import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateGameRoomDto } from './dto/create-game-room.dto';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import {
  GameRoomInfo,
  GameRoomInfoWithMemberCount,
  UpdateGameRoomDto,
  UserProfileInGame,
} from './dto';
import IORedis from 'ioredis';
import { GamePrefix } from './constants/prefix';
import { GameGateway } from '../event/game/game.gateway';
import { Event } from '../event/game/constants';
import { REDIS_GAME } from '../redis';

export type Ok = 'OK';

@Injectable()
export class GameRoomService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @InjectRedis(REDIS_GAME) private readonly redis: Redis,
    private readonly gameGateway: GameGateway,
  ) {}

  async create(
    createGameDto: CreateGameRoomDto,
    profile: UserProfileInGame,
  ): Promise<GameRoomInfo> {
    const gameRoomNumber: number = await this.getGameId();
    createGameDto.gameRoomNumber = gameRoomNumber;
    await this.saveGameInfo(createGameDto);
    await this.addUserInGame(gameRoomNumber, profile);
    return await this.findGameInfo(this.getKeyOfSavedGameInfo(gameRoomNumber));
  }

  async update(
    gameRoomNumber: number,
    updateGameDto: UpdateGameRoomDto,
    profile: UserProfileInGame,
  ) {
    const leader = await this.findMember(gameRoomNumber, 0);
    if (leader.userId !== profile.userId) {
      throw new ForbiddenException('방 수정 권한이 없습니다');
    }
    updateGameDto.gameRoomNumber = gameRoomNumber;
    await this.saveGameInfo(updateGameDto);
    const gameRoomInfo = await this.findGameInfo(
      this.getKeyOfSavedGameInfo(gameRoomNumber),
    );
    this.gameGateway.server
      .to(`game-${gameRoomNumber}`)
      .emit(Event.UPDATE, gameRoomInfo);
    return { message: '방 정보가 수정 완료' };
  }

  async join(
    gameRoomNumber: number,
    profile: UserProfileInGame,
  ): Promise<GameRoomInfo> {
    await this.addUserInGame(gameRoomNumber, profile);
    return await this.findGameInfo(this.getKeyOfSavedGameInfo(gameRoomNumber));
  }

  // async mergeGameInfoAndMembers(
  //   gameRoomNumber: number,
  // ): Promise<GameInfoWithGameMembers> {
  //   const gameRoomInfo: GameInfoWithGameMembers = await this.findGameInfo(
  //     this.getKeyOfSavedGameInfo(gameRoomNumber),
  //   );
  //   gameRoomInfo.members = await this.findMembers(gameRoomNumber);
  //   return gameRoomInfo;
  // }

  async saveGameInfo(
    gameDto: CreateGameRoomDto | UpdateGameRoomDto,
  ): Promise<Ok | null> {
    return await this.redis.set(
      this.getKeyOfSavedGameInfo(gameDto.gameRoomNumber),
      JSON.stringify(gameDto),
    );
  }

  async addUserInGame(
    gameRoomNumber: number,
    profile: UserProfileInGame,
  ): Promise<number> {
    return await this.redis.rpush(
      this.getKeyOfSavedUserInfo(gameRoomNumber),
      JSON.stringify(profile),
    );
  }
  async findMember(
    gameRoomNumber: number,
    index: number,
  ): Promise<UserProfileInGame> {
    return JSON.parse(
      await this.redis.lindex(
        this.getKeyOfSavedUserInfo(gameRoomNumber),
        index,
      ),
    );
  }

  async findMembers(gameRoomNumber: number): Promise<UserProfileInGame[]> {
    return (
      await this.redis.lrange(this.getKeyOfSavedUserInfo(gameRoomNumber), 0, 9)
    ).map((member) => JSON.parse(member));
  }

  async findAll(): Promise<GameRoomInfoWithMemberCount[]> {
    const gameKeys: IORedis.KeyType[] = await this.findAllGameKeys();
    return await this.findAllGame(gameKeys);
  }

  async findGameInfo(gameKey: IORedis.KeyType): Promise<GameRoomInfo> {
    return JSON.parse(await this.redis.get(gameKey));
  }

  async findAllGame(
    gameKeys: IORedis.KeyType[],
  ): Promise<GameRoomInfoWithMemberCount[]> {
    return await Promise.all(
      gameKeys.map(async (key: IORedis.KeyType) => {
        const game: GameRoomInfoWithMemberCount = await this.findGameInfo(key);
        game.memberCount = await this.countUsersInGame(game.gameRoomNumber);
        return game;
      }),
    );
  }

  async countUsersInGame(gameRoomNumber: number): Promise<number> {
    return await this.redis.llen(this.getKeyOfSavedUserInfo(gameRoomNumber));
  }

  async findAllGameKeys(): Promise<IORedis.KeyType[]> {
    return await this.redis.keys(`${GamePrefix.gameRoomInfo}*`);
  }
  isMember(members: UserProfileInGame[], userId: number): boolean {
    for (const member of members) {
      if (member.userId === userId) return true;
    }
    return false;
  }
  async isLastMember(gameRoomNumber: number): Promise<boolean> {
    const memberCount: number = await this.countUsersInGame(gameRoomNumber);
    if (memberCount === 1) return true;
    return false;
  }

  async leave(
    gameRoomNumber: number,
    profile: UserProfileInGame,
  ): Promise<object> {
    if (await this.isLastMember(gameRoomNumber)) {
      return await this.remove(gameRoomNumber);
    }
    await this.redis.lrem(
      this.getKeyOfSavedUserInfo(gameRoomNumber),
      1,
      JSON.stringify(profile),
    );
    return { userId: profile.userId, exit: true };
  }
  async remove(gameRoomNumber: number): Promise<object> {
    //del -> unlink로 바꿔야함 window redis version때문에 어쩔 수 없음
    await this.redis.del(
      this.getKeyOfSavedGameInfo(gameRoomNumber),
      this.getKeyOfSavedUserInfo(gameRoomNumber),
    );
    return { gameRoomNumber, delete: true };
  }
  async getGameId(): Promise<number> {
    return await this.redis.incr(GamePrefix.gameRoomNumber);
  }

  getKeyOfSavedGameInfo(gameRoomNumber: number): IORedis.KeyType {
    return `${GamePrefix.gameRoomInfo}${gameRoomNumber}`;
  }

  getKeyOfSavedUserInfo(gameRoomNumber: number): IORedis.KeyType {
    return `${GamePrefix.gameRoomMembers}${gameRoomNumber}`;
  }
}
