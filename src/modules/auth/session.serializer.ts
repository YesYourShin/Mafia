import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { ONLINE } from '../gateway/game-room/constants';
import { UserGateway } from '../gateway/user/user.gateway';
import { RedisService } from '../redis/redis.service';
import { FriendProfile, UserProfile } from '../user/dto';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly userGateway: UserGateway,
  ) {
    super();
  }

  serializeUser(user: UserProfile, done: CallableFunction) {
    done(null, user.id);
  }

  async deserializeUser(id: number, done: CallableFunction) {
    try {
      const user = await this.userRepository.findOne({ id });
      const friends: FriendProfile[] =
        (await this.userRepository.findFriend(user.id)) || [];

      if (friends && friends.length) {
        user.friends = await this.setOnline(friends);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
  async setOnline(friends: any[]) {
    for (const friend of friends) {
      friend.online = await this.getOnline(friend);
    }
    return friends;
  }
  async getOnline(friend: FriendProfile) {
    const result = await this.redisService.getbit(ONLINE, friend.userId);
    return result ? true : false;
  }
}
