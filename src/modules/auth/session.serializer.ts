import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/entities/User';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  serializeUser(user: User, done: CallableFunction) {
    console.log('serializeUser', user);
    done(null, user.id);
  }

  async deserializeUser(id: number, done: CallableFunction) {
    try {
      const user = await this.userRepository.findOneById(id);
      console.log('deserializeUser', user);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
