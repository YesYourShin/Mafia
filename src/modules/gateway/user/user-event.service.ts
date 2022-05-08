import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/modules/redis/redis.service';
import { FriendProfile } from 'src/modules/user/dto';
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

  async getOnline(userId: number) {
    return await this.redisService.getbit(ONLINE, userId);
  }

  async getNsps(friends: FriendProfile[]) {
    const result = [];
    for (const friend of friends) {
      const online = await this.getOnline(friend.userId);
      console.log('online', online);
      if (online) {
        result.push(`/user-${friend.userId}`);
      }
    }
    return result;
  }
}
