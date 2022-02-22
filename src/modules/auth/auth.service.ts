import { Injectable } from '@nestjs/common';
import { UserProvider } from 'src/constants';
import { OauthProfile } from 'src/constants/oauth-provider';
import { oauthVerifyCallback } from 'src/constants/oauth-verify-callback';
import { JoinRequestUserDto } from '../user/dto/join-request-user.dto';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: OauthProfile,
    done: oauthVerifyCallback,
  ) {
    const joinRequestUser: JoinRequestUserDto = {
      socialId: profile.id,
      provider: profile.provider.toUpperCase() as UserProvider,
    };
    try {
      const user = await this.userRepository.firstOrCreate(joinRequestUser);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
