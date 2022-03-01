import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { OauthProfile } from 'src/common/constants/oauth-provider';
import { Strategy } from 'passport-kakao';
import { AuthService } from './auth.service';

@Injectable()
export class KakaoOauthStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly authService: AuthService) {
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
    return await this.authService.validate(
      _accessToken,
      _refreshToken,
      profile,
      done,
    );
  }
}
