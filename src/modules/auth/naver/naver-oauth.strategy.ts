import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserRepository } from 'src/modules/user/user.repository';
import { Strategy } from 'passport-naver';
import { JoinRequestUserDto } from 'src/modules/user/dto/join-request-user.dto';
import { OauthProfile } from 'src/constants/oauth-provider';

@Injectable()
export class NaverOauthStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly userRepository: UserRepository) {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: process.env.NAVER_CALLBACK,
    });
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: OauthProfile,
    done: (error: any, user?: any, info?: any) => void,
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
