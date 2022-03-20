import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserProfile } from '../user/dto';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor() {
    super();
  }

  serializeUser(user: UserProfile, done: CallableFunction) {
    console.log('serializeUser', user);
    done(null, user);
  }

  async deserializeUser(user: UserProfile, done: CallableFunction) {
    try {
      console.log('deserializeUser', user);
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
}
