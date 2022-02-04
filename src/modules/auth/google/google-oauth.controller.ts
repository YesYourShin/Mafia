import {
  Controller,
  Get,
  HttpStatus,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';
import { NotLoggedInGuard } from '../guards/not-logged-in.guard';

@ApiTags('Auth')
@Controller('/auth/google')
export class GoogleOauthController {
  constructor() {}

  @ApiOperation({ summary: 'Google 로그인' })
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('login')
  googleAuth() {}

  @ApiOperation({ summary: 'Google 로그인 callback url' })
  @Redirect('http://localhost:3065/api/v1')
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('redirect')
  googleAuthRedirect(@Req() req) {
    return req.user;
  }
}
