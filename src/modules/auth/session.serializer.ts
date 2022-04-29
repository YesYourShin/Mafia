import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { FriendProfile, UserProfile } from '../user/dto';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  serializeUser(user: UserProfile, done: CallableFunction) {
    done(null, user.id);
  }

  async deserializeUser(id: number, done: CallableFunction) {
    try {
      const user = await this.userRepository.findOne({ id });
      const friends: FriendProfile[] = await this.userRepository.findFriend(
        user.id,
      );
      user.friends = friends;
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
