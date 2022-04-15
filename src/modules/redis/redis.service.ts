import { Injectable } from '@nestjs/common';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import { KeyType, ValueType } from 'ioredis';
import { ROOM_NUMBER } from '../gateway/game-room/constants';
import { REDIS_GAME } from './redis-option';

@Injectable()
export class RedisService {
  constructor(@InjectRedis(REDIS_GAME) private readonly redis: Redis) {}

  async hset<T>(key: string, field: string, value: T): Promise<any> {
    return await this.redis.hset(key, { [`${field}`]: JSON.stringify(value) });
  }

  async hget(key: string, field: string) {
    return JSON.parse(await this.redis.hget(key, field));
  }

  async hmget(key: string, fields: string[]): Promise<string[]> {
    return await this.redis.hmget(key, fields);
  }

  async hkeys(key: string): Promise<string[]> {
    return await this.redis.hkeys(key);
  }
  async unlink(keys: string[]) {
    return await this.redis.unlink(keys);
  }
  async del(keys: string | string[]) {
    return await this.redis.del(keys);
  }
  hdel<T extends string, U extends string | string[]>(
    key: T,
    field: U,
  ): Promise<any>;
  async hdel(key: string, field: string | string[]): Promise<any> {
    return await (Array.isArray(field)
      ? this.redis.hdel(key, field)
      : this.redis.hdel(key, [field]));
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.redis.keys(pattern);
  }

  async setbit(
    key: KeyType,
    offset: number,
    value: ValueType,
  ): Promise<number> {
    return await this.redis.setbit(key, offset, value);
  }

  async incr() {
    return await this.redis.incr(ROOM_NUMBER);
  }

  // getBitpos() {
  //   return this.redis.createBuiltinCommand('bitpos') as any;
  // }

  // bitpos(key: string, bit: string | number): Promise<number>;
  // bitpos(
  //   key: string,
  //   bit: string | number,
  //   start: string | number,
  // ): Promise<number>;
  // bitpos(
  //   key: string,
  //   bit: string | number,
  //   start: string | number,
  //   end: string | number,
  // ): Promise<number>;
  // bitpos(
  //   key: string,
  //   bit: string | number,
  //   start: string | number,
  //   end: string | number,
  //   byte: 'BYTE',
  // ): Promise<number>;
  // async bitpos(key: string, bit: string | number): Promise<number> {}
}
