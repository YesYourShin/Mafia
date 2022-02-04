import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/modules/user/user.repository';
import { JoinRequestUserDto } from 'src/modules/user/dto/join-request-user.dto';
import { OauthProfile } from 'src/constants/oauth-provider';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly userRepository: UserRepository) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: OauthProfile,
    done: VerifyCallback,
  ) {
    const joinRequestUser: JoinRequestUserDto = {
      memberShipCode: profile.id,
      provider: profile.provider,
    };

    const user = await this.userRepository.firstOrCreate(joinRequestUser);

    if (user) {
      done(null, user);
    }
  }
}
