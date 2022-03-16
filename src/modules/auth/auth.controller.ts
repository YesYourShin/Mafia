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
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ResponseDto } from 'src/common/dto';
import { UserDecorator } from 'src/decorators/user.decorator';
import { LogoutInterceptor } from 'src/interceptors';
import { UserProfile } from '../user/dto';
import { AuthService } from './auth.service';
import {
  GoogleOauthGuard,
  KakaoOauthGuard,
  LoggedInGuard,
  NaverOauthGuard,
  NotLoggedInGuard,
} from './guards';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Google 로그인 프런트가 들어올 url' })
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('google/login')
  googleAuth() {}

  @ApiOperation({ summary: 'Google 로그인 callback url' })
  @ApiResponse({
    status: 301,
    description: '로그인 성공 후 쿠키 전송',
  })
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('google/redirect')
  googleAuthRedirect(@Res() res: Response) {
    return res.redirect(
      this.configService.get('FRONT_URL') as string,
      HttpStatus.MOVED_PERMANENTLY,
    );
  }

  @ApiOperation({ summary: 'Naver 로그인 프런트가 들어올 url' })
  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('naver/login')
  naverAuth() {}

  @ApiResponse({
    status: 301,
    description: '로그인 성공 후 쿠키 전송',
  })
  @ApiOperation({ summary: 'Naver 로그인 callback url' })
  @Redirect(process.env.FRONT_URL, 301)
  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('naver/redirect')
  naverAuthRedirect(@Res() res: Response) {
    return res.redirect(
      this.configService.get('FRONT_URL') as string,
      HttpStatus.MOVED_PERMANENTLY,
    );
  }

  @ApiOperation({ summary: 'Kakao 로그인 프런트가 들어올 url' })
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('kakao/login')
  kakaoAuth() {}

  @ApiResponse({
    status: 301,
    description: '로그인 성공 후 쿠키 전송',
  })
  @ApiOperation({ summary: 'Kakao 로그인 callback url' })
  @Redirect(process.env.FRONT_URL, 301)
  @UseGuards(NotLoggedInGuard, KakaoOauthGuard)
  @Get('kakao/redirect')
  kakaoAuthRedirect(@Res() res: Response) {
    return res.redirect(
      this.configService.get('FRONT_URL') as string,
      HttpStatus.MOVED_PERMANENTLY,
    );
  }

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
  @UseInterceptors(LogoutInterceptor)
  @UseGuards(LoggedInGuard)
  @HttpCode(200)
  @Post('logout')
  async logout(@UserDecorator() user: UserProfile): Promise<object> {
    return await this.authService.logout(user);
  }
}
