import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { KakaoOauthGuard } from '../guards/kakao-oauth.guard';
import { NotLoggedInGuard } from '../guards/not-logged-in.guard';

@Controller('/auth/kakao')
export class KakaoOauthController {
  constructor() {}

  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('login')
  kakaoAuth() {}

  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('redirect')
  kakaoAuthRedirect(@Req() req) {
    return req.user;
  }
}
