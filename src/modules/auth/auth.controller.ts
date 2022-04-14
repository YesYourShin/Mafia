import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Redirect,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { UserDecorator } from 'src/decorators/user.decorator';
import { LogoutInterceptor } from 'src/interceptors';
import { ClearCookieInterceptor } from 'src/interceptors/clear-cookie.interceptor';
import { UserProfile } from '../user/dto';
import { AuthService } from './auth.service';
import {
  GoogleOauthGuard,
  KakaoOauthGuard,
  LoggedInGuard,
  NaverOauthGuard,
  NotLoggedInGuard,
} from './guards';

export const FRONT_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://gjgjajaj.xyz'
    : 'http://localhost:7000';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Google 로그인 프런트가 들어올 url' })
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('google/login')
  googleAuth() {}

  @Redirect(FRONT_URL, HttpStatus.MOVED_PERMANENTLY)
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('google/redirect')
  googleAuthRedirect() {}

  @ApiOperation({ summary: 'Naver 로그인 프런트가 들어올 url' })
  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('naver/login')
  naverAuth() {}

  @Redirect(FRONT_URL, HttpStatus.MOVED_PERMANENTLY)
  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('naver/redirect')
  naverAuthRedirect() {}

  @ApiOperation({ summary: 'Kakao 로그인 프런트가 들어올 url' })
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('kakao/login')
  kakaoAuth() {}

  @Redirect(FRONT_URL, HttpStatus.MOVED_PERMANENTLY)
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('kakao/redirect')
  kakaoAuthRedirect() {}

  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    schema: {
      example: new ResponseDto(true, 200, {
        userId: 1,
        logout: true,
      }),
    },
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '로그아웃' })
  @UseInterceptors(LogoutInterceptor, ClearCookieInterceptor)
  @UseGuards(LoggedInGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(@UserDecorator() user: UserProfile): Promise<object> {
    return await this.authService.logout(user);
  }
}
