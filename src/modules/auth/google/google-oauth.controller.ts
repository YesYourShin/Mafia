import {
  Controller,
  Get,
  HttpStatus,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GoogleOauthGuard } from '../guards/google-oauth.guard';
import { NotLoggedInGuard } from '../guards/not-logged-in.guard';

@Controller('/auth/google')
export class GoogleOauthController {
  constructor() {}

  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('login')
  googleAuth() {}

  @Redirect('http://localhost:3065/api/v1')
  @UseGuards(NotLoggedInGuard, GoogleOauthGuard)
  @Get('redirect')
  googleAuthRedirect(@Req() req) {
    return HttpStatus.CREATED;
  }
}
