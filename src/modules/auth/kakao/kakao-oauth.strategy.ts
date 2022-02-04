import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserRepository } from 'src/modules/user/user.repository';
import { JoinRequestUserDto } from 'src/modules/user/dto/join-request-user.dto';
import { OauthProfile } from 'src/constants/oauth-provider';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoOauthStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly userRepository: UserRepository) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK,
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
