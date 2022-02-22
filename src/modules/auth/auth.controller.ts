import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  LoggerService,
  Post,
  Redirect,
  Req,
  Request,
  Response,
  Session,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Session as ExpressSession } from 'express-session';
import { ClearCookieInterceptor } from 'src/interceptors/ClearCookieInterceptor';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { KakaoOauthGuard } from './guards/kakao-oauth.guard';
import { LoggedInGuard } from './guards/logged-in.guard';
import { NaverOauthGuard } from './guards/naver-oauth.guard';
import { NotLoggedInGuard } from './guards/not-logged-in.guard';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}

  @ApiOperation({ summary: 'Google 로그인' })
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('google/login')
  googleAuth() {}

  @ApiOperation({ summary: 'Google 로그인 callback url' })
  @ApiResponse({
    status: 301,
    description: '로그인 성공 후 쿠키 전송',
  })
  @Redirect('https://gjgjajaj.xyz', 301)
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('google/redirect')
  googleAuthRedirect(@Req() req) {
    return req.user;
  }

  @ApiOperation({ summary: 'Naver 로그인' })
  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('naver/login')
  naverAuth() {}

  @ApiResponse({
    status: 301,
    description: '로그인 성공 후 쿠키 전송',
  })
  @ApiOperation({ summary: 'Naver 로그인 callback url' })
  @Redirect('https://gjgjajaj.xyz', 301)
  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('naver/redirect')
  naverAuthRedirect(@Req() req) {
    return req.user;
  }

  @ApiOperation({ summary: 'Kakao 로그인' })
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('kakao/login')
  kakaoAuth() {}

  @ApiResponse({
    status: 301,
    description: '로그인 성공 후 쿠키 전송',
  })
  @ApiOperation({ summary: 'Kakao 로그인 callback url' })
  @Redirect('https://gjgjajaj.xyz', 301)
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('kakao/redirect')
  kakaoAuthRedirect(@Req() req) {
    return req.user;
  }

  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '로그아웃' })
  @UseInterceptors(ClearCookieInterceptor)
  @UseGuards(LoggedInGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(@Session() session: ExpressSession) {
    session.destroy((err) => {});
    return { success: true };
  }
}
