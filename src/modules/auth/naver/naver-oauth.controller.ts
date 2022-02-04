import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NaverOauthGuard } from '../guards/naver-oauth.guard';
import { NotLoggedInGuard } from '../guards/not-logged-in.guard';

@Controller('/auth/naver')
export class NaverOauthController {
  constructor() {}

  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('login')
  naverAuth() {}

  @UseGuards(NotLoggedInGuard, NaverOauthGuard)
  @Get('redirect')
  naverAuthRedirect(@Req() req) {
    return req.user;
  }
}
