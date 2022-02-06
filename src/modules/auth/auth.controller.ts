import { Controller, Get, Redirect, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { KakaoOauthGuard } from './guards/kakao-oauth.guard';
import { NaverOauthGuard } from './guards/naver-oauth.guard';
import { NotLoggedInGuard } from './guards/not-logged-in.guard';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor() {}

  @ApiOperation({ summary: 'Google 로그인' })
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('google/login')
  googleAuth() {}

  @ApiOperation({ summary: 'Google 로그인 callback url' })
  @Redirect('http://localhost:3065/api/v1/users')
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('google/redirect')
  googleAuthRedirect(@Req() req) {
    return req.user;
  }

  @ApiOperation({ summary: 'Naver 로그인' })
  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('naver/login')
  naverAuth() {}

  @ApiOperation({ summary: 'Naver 로그인 callback url' })
  @Redirect('http://localhost:3065/api/v1/users')
  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('naver/redirect')
  naverAuthRedirect(@Req() req) {
    return req.user;
  }

  @ApiOperation({ summary: 'Kakao 로그인' })
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('kakao/login')
  kakaoAuth() {}

  @ApiOperation({ summary: 'Kakao 로그인 callback url' })
  @Redirect('http://localhost:3065/api/v1/users')
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('kakao/redirect')
  kakaoAuthRedirect(@Req() req) {
    return req.user;
  }
}
