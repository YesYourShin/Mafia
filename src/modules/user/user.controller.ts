import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserDecorator } from 'src/decorators/user.decorator';
import { Profile } from 'src/entities/Profile';
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
  @ApiOkResponse({
    description: '중복된 닉네임이 아닌 경우',
    schema: {
      example: { message: '사용 가능한 닉네임입니다.' },
    },
  })
  @ApiConflictResponse({
    description: '중복된 이름일 경우',
    schema: {
      example: '중복된 닉네임입니다.',
    },
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '닉네임 중복 확인' })
  @UseGuards(LoggedInGuard)
  @Get('profile/check-duplicate/nickname/:nickname')
  async checkDuplicateNickname(@Param('nickname') nickname: string) {
    return await this.userService.checkDuplicateNickname(nickname);
  }
  @ApiOkResponse({
    description: '유저 프로필 불러오기 성공',
    type: Profile,
  })
  @ApiNotFoundResponse({
    description: '프로필이 존재하지 않을 때',
    schema: {
      example: '프로필이 존재하지 않습니다.',
    },
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '유저 번호',
  })
  @ApiOperation({ summary: '특정 유저 정보 불러오기' })
  @UseGuards(LoggedInGuard)
  @Get('profile')
  async getMyProfile(@UserDecorator() user): Promise<Profile> {
    return user;
  }

  @ApiOkResponse({
    description: '유저 프로필 불러오기 성공',
    type: Profile,
  })
  @ApiNotFoundResponse({
    description: '프로필이 존재하지 않을 때',
    schema: {
      example: '프로필이 존재하지 않습니다.',
    },
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '유저 번호',
  })
  @ApiOperation({ summary: '특정 유저 정보 불러오기' })
  @Get('profile/:id')
  async getUserProfile(@Param('id') id: string): Promise<Profile> {
    return await this.userService.findProfile(+id);
  }

  @ApiResponse({
    status: 201,
    description: '프로필 이미지 저장 성공',
    schema: { example: { url: 'https://aaa.com/cat.jpg' } },
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '프로필 이미지 저장' })
  @UseGuards(LoggedInGuard)
  @ApiConsumes('multipart/form-data')
  @Post('profile/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(@UploadedFile() image: Express.Multer.File) {
    console.log(image);
  }

  @ApiOkResponse({
    status: 201,
    description: '프로필 생성 성공',
    type: ResponseUserProfileDto,
  })
  @ApiForbiddenResponse({
    description: '프로필이 이미 존재할 때',
    schema: { example: '프로필이 이미 존재합니다.' },
  })
  @ApiCookieAuth('connect.sid')
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

  @ApiOkResponse({
    description: '친구 신청 성공',
    schema: { example: { message: '친구 신청이 되었습니다.' } },
  })
  @ApiForbiddenResponse({
    description: '유저를 친구 추가 불가능 할 경우',
    schema: { example: '친구 추가를 할 수 없습니다.' },
  })
  @ApiNotFoundResponse({
    description: '유저가 존재하지 않는 경우',
    schema: { example: '등록되지 않은 유저입니다.' },
  })
  @ApiParam({ name: 'id', required: true, description: '친구 아이디' })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '친구 신청' })
  @UseGuards(LoggedInGuard)
  @Patch('friend/:id')
  async requestFriend() {}

  @ApiOkResponse({
    description: '친구 삭제 성공',
    schema: { example: { message: '친구를 삭제 했습니다.' } },
  })
  @ApiForbiddenResponse({
    description: '친구 삭제할 권한이 없을 때(친구가 아닌 상태 등)',
    schema: { example: '친구 삭제할 권한이 없습니다.' },
  })
  @ApiNotFoundResponse({
    description: '유저가 존재하지 않는 경우',
    schema: { example: '등록되지 않은 유저입니다.' },
  })
  @ApiParam({ name: 'id', required: true, description: '친구 아이디' })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '친구 제거' })
  @UseGuards(LoggedInGuard)
  @Delete('friend/:id')
  async removeFriend() {}

  @ApiResponse({
    status: 201,
    description: '프로필 수정 성공',
    type: ResponseUserProfileDto,
  })
  @ApiNotFoundResponse({
    description: '프로필이 없는 경우',
    schema: { example: '등록된 프로필이 없습니다.' },
  })
  @ApiCookieAuth('connect.sid')
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
  @ApiResponse({
    status: 200,
    description: '회원 탈퇴 성공',
  })
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiCookieAuth('connect.sid')
  @UseGuards(LoggedInGuard)
  @Delete()
  async destroy(@UserDecorator() user: User) {
    return await this.userService.remove(user.id);
  }
}
