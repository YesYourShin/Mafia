import { Injectable } from '@nestjs/common';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import {
  GAME,
  GAME_ROOM_INFO,
  GAME_ROOM_MEMBERS,
  GAME_ROOM_READY_MEMBERS,
} from '../gateway/game-room/constants';
import { CreateGameRoomDto, Member, UpdateGameRoomDto } from '../game-room/dto';
import { REDIS_GAME } from './redis-option';

@Injectable()
export class RedisGameService {
  constructor(@InjectRedis(REDIS_GAME) private readonly redis: Redis) {}

  async hset(
    field: string,
    value: CreateGameRoomDto | UpdateGameRoomDto | Member[],
  ): Promise<any> {
    return await this.redis.hset(GAME, { [`${field}`]: JSON.stringify(value) });
  }

  async hget(field: string) {
    return JSON.parse(await this.redis.hget(GAME, field));
  }

  async hmget(fields: string[]): Promise<string[]> {
    return await this.redis.hmget(GAME, fields);
  }

  async hincrby(field: string, increment: number): Promise<number> {
    return await this.redis.hincrby(GAME, field, increment);
  }
  async hkeys() {
    return await this.redis.hkeys(GAME);
  }
  async hdel(gameRoomNumber) {
    await this.redis.hdel(GAME, [
      `${GAME_ROOM_INFO}${gameRoomNumber}`,
      `${GAME_ROOM_MEMBERS}${gameRoomNumber}`,
      `${GAME_ROOM_READY_MEMBERS}${GAME_ROOM_READY_MEMBERS}`,
    ]);
  }
}
