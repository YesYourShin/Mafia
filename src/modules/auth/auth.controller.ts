import {
  Controller,
  Get,
  Post,
  Redirect,
  Req,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { KakaoOauthGuard } from './guards/kakao-oauth.guard';
import { LoggedInGuard } from './guards/logged-in.guard';
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
  @Redirect('http://localhost:3065/api/v1/users/profile')
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
  @Redirect('http://localhost:3065/api/v1/users/profile')
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
  @Redirect('http://localhost:3065/api/v1/users/profile')
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('kakao/redirect')
  kakaoAuthRedirect(@Req() req) {
    return req.user;
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '로그아웃' })
  @UseGuards(LoggedInGuard)
  @Post('logout')
  async logout(@Response() res) {
    res.clearCookie('connect.sid', { httpOnly: true });
    return res.send('ok');
  }
}
