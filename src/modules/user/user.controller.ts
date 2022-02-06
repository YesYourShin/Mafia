import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { LoggedInGuard } from '../auth/guards/logged-in.guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(LoggedInGuard)
  @Get()
  async getUser(@Req() req) {
    return req.user;
  }
}
