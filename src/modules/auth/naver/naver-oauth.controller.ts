import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NaverOauthGuard } from '../guards/naver-oauth.guard';
import { NotLoggedInGuard } from '../guards/not-logged-in.guard';

@ApiTags('Auth')
@Controller('/auth/naver')
export class NaverOauthController {
  constructor() {}

  @ApiOperation({ summary: 'Naver 로그인' })
  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('login')
  naverAuth() {}

  @ApiOperation({ summary: 'Naver 로그인 callback url' })
  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('redirect')
  naverAuthRedirect(@Req() req) {
    return req.user;
  }
}
