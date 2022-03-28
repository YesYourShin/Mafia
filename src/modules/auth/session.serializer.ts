import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserProfile } from '../user/dto';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  serializeUser(user: UserProfile, done: CallableFunction) {
    console.log('serializeUser', user);
    done(null, user);
  }

  async deserializeUser(user: UserProfile, done: CallableFunction) {
    try {
      console.log('deserializeUser', user);
      if (!user?.profile) {
        user = await this.userRepository.findOne({ id: user.id });
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
