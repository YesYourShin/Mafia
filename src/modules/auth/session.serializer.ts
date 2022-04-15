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
    done(null, user);
  }

  async deserializeUser(user: UserProfile, done: CallableFunction) {
    try {
      user = await this.userRepository.findOne({ id: user.id });
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
