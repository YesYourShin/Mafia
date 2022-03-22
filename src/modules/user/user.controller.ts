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
import { ApiFile } from 'src/decorators/api-file.decorator';
import { UserDecorator } from 'src/decorators/user.decorator';
import { User, Profile } from 'src/entities';
import { s3 } from 'src/shared/MulterS3Service ';
import { LoggedInGuard } from '../auth/guards';
import {
  ResponseUserProfileDto,
  UpdateProfileDto,
  ResponseProfileDto,
  CreateProfileDto,
  UserProfile,
} from './dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
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
  async getUserProfile(@Param('id') id: string): Promise<Profile> {
    return await this.userService.findProfile(+id);
  }

  @ApiCreatedResponse({
    description: '프로필 이미지 저장 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.CREATED, {
        url: 'https://aaa.com/cat.jpg',
      }),
    },
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
    console.log(image);
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
    await this.userService.createProfile(user.id, profile);
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
    await this.userService.updateProfile(user.id, profile);
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
  @UseGuards(LoggedInGuard)
  @Delete()
  async destroy(@UserDecorator() user: User) {
    return await this.userService.remove(user.id);
  }
  //게시물 존재 및 게시물 권한 확인
  @ApiOperation({ summary: '게시물 이미지 삭제' })
  @Delete('profile/image')
  async removeImage(@Query('image') key: string) {
    s3.deleteObject(
      {
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: key,
      },
      function (err, data) {},
    );
  }
}
