import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KakaoOauthGuard } from '../guards/kakao-oauth.guard';
import { NotLoggedInGuard } from '../guards/not-logged-in.guard';

@ApiTags('Auth')
@Controller('/auth/kakao')
export class KakaoOauthController {
  constructor() {}

  @ApiOperation({ summary: 'Kakao 로그인' })
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('login')
  kakaoAuth() {}

  @ApiOperation({ summary: 'Kakao 로그인 callback url' })
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('redirect')
  kakaoAuthRedirect(@Req() req) {
    return req.user;
  }
}
