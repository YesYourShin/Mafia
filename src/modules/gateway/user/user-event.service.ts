import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/modules/redis/redis.service';
import { ONLINE } from '../game-room/constants';

@Injectable()
export class UserEventService {
  constructor(private readonly redisService: RedisService) {}

  async setOnline(userId: number) {
    await this.redisService.setbit(ONLINE, userId, 1);
  }

  async setOffline(userId: number) {
    await this.redisService.setbit(ONLINE, userId, 0);
  }
}
