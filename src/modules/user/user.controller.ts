import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { ExistedProfileGuard } from 'src/common/guards';
import { ApiFile } from 'src/decorators/api-file.decorator';
import { UserDecorator } from 'src/decorators/user.decorator';
import { User } from 'src/entities';
import { LogoutInterceptor } from 'src/interceptors';
import { ClearCookieInterceptor } from 'src/interceptors/clear-cookie.interceptor';
import { LoggedInGuard } from '../auth/guards';
import {
  ResponseS3ImageObject,
  S3ImageObject,
} from '../image/dto/s3-image-object';
import { ImageService } from '../image/image.service';
import {
  ResponseUserProfileDto,
  UpdateProfileDto,
  ResponseProfileDto,
  CreateProfileDto,
  UserProfile,
  ProfileInfo,
} from './dto';
import { MyProfileImageGuard } from './guards/my-profile-image.guard';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly imageService: ImageService,
    private readonly configService: ConfigService,
  ) {}

  @ApiParam({
    name: 'nickname',
    required: true,
    description: '유저 닉네임',
  })
  @ApiOkResponse({
    description: '중복된 닉네임이 아닌 경우',
    schema: {
      example: new ResponseDto(true, HttpStatus.OK, {
        message: '사용 가능한 닉네임입니다',
      }),
    },
  })
  @ApiConflictResponse({
    description: '중복된 이름일 경우',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.CONFLICT,
        '중복된 닉네임입니다',
      ),
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
    description: '내 정보 가져오기 성공',
    type: ResponseUserProfileDto,
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '내 정보 가져오기' })
  @UseGuards(LoggedInGuard)
  @Get()
  async getMyInfo(@UserDecorator() user: UserProfile) {
    return user;
  }
  @ApiOkResponse({
    description: '유저 프로필 불러오기 성공',
    type: ResponseProfileDto,
  })
  @ApiNotFoundResponse({
    description: '프로필이 존재하지 않을 때',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.NOT_FOUND,
        '프로필이 존재하지 않습니다',
      ),
    },
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '유저 번호',
  })
  @ApiOperation({ summary: '특정 유저 정보 불러오기' })
  @Get('profile/:id')
  async getUserProfile(@Param('id') id: number): Promise<ProfileInfo> {
    return await this.userService.findProfile(id);
  }

  @ApiCreatedResponse({
    description: '프로필 이미지 저장 성공',
    type: ResponseS3ImageObject,
  })
  @ApiBadRequestResponse({
    description: '잘못된 형식으로 이미지를 보냈을 때',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.BAD_REQUEST,
        '이미지만 업로드 가능합니다',
      ),
    },
  })
  @ApiCookieAuth('connect.sid')
  @ApiConsumes('multipart/form-data')
  @ApiFile('image')
  @ApiOperation({ summary: '프로필 이미지 저장' })
  @UseGuards(LoggedInGuard)
  @Post('profile/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadProfileImage(@UploadedFile() image: Express.MulterS3.File) {
    return new S3ImageObject(image);
  }

  @ApiOkResponse({
    status: HttpStatus.CREATED,
    description: '프로필 생성 성공',
    type: ResponseUserProfileDto,
  })
  @ApiForbiddenResponse({
    description: '프로필이 이미 존재할 때',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.FORBIDDEN,
        '등록된 프로필이 존재합니다',
      ),
    },
  })
  @ApiBody({
    type: CreateProfileDto,
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '프로필 생성' })
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('profile')
  async createProfile(
    @UserDecorator() user: UserProfile,
    @Body() profile: CreateProfileDto,
  ) {
    await this.userService.createProfile(user, profile);
    return await this.userService.findOne(user.id);
  }

  @ApiOkResponse({
    description: '친구 신청 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.OK, {
        message: '친구 신청 완료',
      }),
    },
  })
  @ApiForbiddenResponse({
    description: '유저를 친구 추가 불가능 할 경우',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.FORBIDDEN,
        '친구 추가를 할 수 없습니다',
      ),
    },
  })
  @ApiNotFoundResponse({
    description: '유저가 존재하지 않는 경우',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.NOT_FOUND,
        '등록되지 않은 유저입니다',
      ),
    },
  })
  @ApiParam({ name: 'id', required: true, description: '친구 아이디' })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '친구 신청' })
  @UseGuards(LoggedInGuard)
  @Patch('friend/:id')
  async requestFriend() {}

  @ApiOkResponse({
    description: '친구 삭제 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.OK, {
        message: '친구 삭제 완료',
      }),
    },
  })
  @ApiForbiddenResponse({
    description: '친구 삭제할 권한이 없을 때(친구가 아닌 상태 등)',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.FORBIDDEN,
        '친구 삭제할 권한이 없습니다',
      ),
    },
  })
  @ApiNotFoundResponse({
    description: '유저가 존재하지 않는 경우',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.NOT_FOUND,
        '등록되지 않은 유저입니다',
      ),
    },
  })
  @ApiParam({ name: 'id', required: true, description: '친구 아이디' })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '친구 제거' })
  @UseGuards(LoggedInGuard)
  @Delete('friend/:id')
  async removeFriend() {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '프로필 수정 성공',
    type: ResponseUserProfileDto,
  })
  @ApiNotFoundResponse({
    description: '프로필이 없는 경우',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.NOT_FOUND,
        '등록된 프로필이 없습니다',
      ),
    },
  })
  @ApiBody({
    type: UpdateProfileDto,
    description:
      'image 안에 있으면 image가 업데이트 됨 / Ex) 이미 profile에 등록된 이미지가 있을 경우 변동이 없을 시 image 객체에 아무것도 넣지 않으면 됨',
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '프로필 수정' })
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch('profile')
  async updateProfile(
    @UserDecorator() user: UserProfile,
    @Body() profile: UpdateProfileDto,
  ) {
    await this.userService.updateProfile(user, profile);
    return await this.userService.findOne(user.id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: '회원 탈퇴 성공',
  })
  @ApiQuery({
    description: 'image 경로',
    name: 'image',
    example: 'original/profile/abc.jpg',
  })
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiCookieAuth('connect.sid')
  @UseInterceptors(LogoutInterceptor, ClearCookieInterceptor)
  @UseGuards(LoggedInGuard)
  @Delete()
  async destroy(@UserDecorator() user: User) {
    return await this.userService.remove(user.id);
  }

  @ApiQuery({
    name: 'key',
    description: '이미지 key값 querystring으로 전달',
    example: '/api/users/profile/image?key=**/cat.jpg',
  })
  @ApiOperation({ summary: '프로필 이미지 삭제' })
  @UseGuards(LoggedInGuard, ExistedProfileGuard, MyProfileImageGuard)
  @Delete('profile/image')
  async removeImage(@Query('key') key: string) {
    return await this.userService.removeImage(key);
  }
}
