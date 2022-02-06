import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { OauthProfile } from 'src/constants/oauth-provider';
import { AuthService } from './auth.service';

@Injectable()
export class NaverOauthStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly authService: AuthService) {
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
    return await this.authService.validate(
      _accessToken,
      _refreshToken,
      profile,
      done,
    );
  }
}
