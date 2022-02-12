import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserDecorator } from 'src/decorators/user.decorator';
import { User } from 'src/entities/User';
import { LoggedInGuard } from '../auth/guards/logged-in.guard';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ResponseUserProfileDto } from './dto/response-user-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiParam({
    name: 'nickname',
    required: true,
    description: '유저 닉네임',
  })
  @ApiOperation({ summary: '닉네임 중복 확인' })
  @UseGuards(LoggedInGuard)
  @Get('profile/check-duplicate/nickname/:nickname')
  async checkDuplicateNickname(@Param('nickname') nickname: string) {
    return await this.userService.checkDuplicateNickname(nickname);
  }

  @ApiResponse({
    status: 200,
    description: '유저 프로필 불러오기 성공',
    type: ResponseUserProfileDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '유저 번호',
  })
  @ApiOperation({ summary: '특정 유저 프로필 불러오기' })
  @HttpCode(201)
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return await this.userService.findOne(+id);
  }

  @ApiResponse({
    status: 200,
    description: '자신의 프로필 불러오기 성공',
    type: ResponseUserProfileDto,
  })
  @ApiOperation({ summary: '자신의 프로필 불러오기' })
  @UseGuards(LoggedInGuard)
  @Get('profile')
  async getProfile(@UserDecorator() user: User) {
    return await this.userService.findOne(user.id);
  }

  @ApiResponse({
    status: 201,
    description: '프로필 이미지 저장 성공',
    schema: { example: { url: 'https://aaa.com/cat.jpg' } },
  })
  @ApiOperation({ summary: '프로필 이미지 저장' })
  @UseGuards(LoggedInGuard)
  @Post('profile/image')
  async saveProfileImage() {}

  @ApiResponse({
    status: 201,
    description: '프로필 생성 성공',
    schema: { example: { url: 'https://aaa.com/cat.jpg' } },
  })
  @ApiOperation({ summary: '프로필 생성' })
  @UseGuards(LoggedInGuard)
  @HttpCode(201)
  @Post('profile')
  async createProfile(
    @UserDecorator() user: User,
    @Body() profile: CreateProfileDto,
  ) {
    await this.userService.createProfile(user.id, profile);
    return await this.userService.findOne(user.id);
  }

  @ApiParam({ name: 'id', required: true, description: '친구 아이디' })
  @ApiOperation({ summary: '친구 신청' })
  @UseGuards(LoggedInGuard)
  @Patch('friend/:id')
  async requestFriend() {}

  @ApiParam({ name: 'id', required: true, description: '친구 아이디' })
  @ApiOperation({ summary: '친구 제거' })
  @UseGuards(LoggedInGuard)
  @Delete('friend/:id')
  async removeFriend() {}

  @ApiResponse({
    status: 201,
    description: '프로필 수정 성공',
    type: ResponseUserProfileDto,
  })
  @ApiOperation({ summary: '프로필 수정' })
  @UseGuards(LoggedInGuard)
  @Patch('profile')
  async updateProfile(
    @UserDecorator() user: User,
    @Body() profile: UpdateProfileDto,
  ) {
    await this.userService.updateProfile(user.id, profile);
    return await this.userService.findOne(user.id);
  }

  @ApiOperation({ summary: '회원 탈퇴' })
  @UseGuards(LoggedInGuard)
  @Delete()
  async destroy(@UserDecorator() user: User) {
    return await this.userService.remove(user.id);
  }
}
