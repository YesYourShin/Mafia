import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  LoggerService,
  Inject,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { s3 } from 'src/shared/MulterS3Service ';
import {
  CreatePostDto,
  ResponsePostsDto,
  ResponsePostWithCommentsDto,
  UpdatePostDto,
} from './dto';
import { UserProfile } from '../user/dto';
import { LoggedInGuard } from '../auth/guards';
import { UserDecorator } from 'src/decorators';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOkResponse({
    description: '게시물들 불러오기',
    type: ResponsePostsDto,
  })
  @ApiOperation({ summary: '게시물들 불러오기' })
  @Get()
  async findAll(
    @Query('category') categoryId: string,
    @Query('page') page: string,
  ) {
    return await this.postService.findAll(+categoryId, +page);
  }
  @ApiParam({
    name: 'id',
    required: true,
    description: '게시물 아이디',
  })
  @ApiOperation({ summary: '게시물 자세히 보기' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.postService.findOne(+id);
  }

  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '이미지들 저장' })
  @UseGuards(LoggedInGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() file: Express.MulterS3.File) {
    return this.postService.uploadImage(file);
  }

  @ApiCreatedResponse({
    description: '게시물 등록 성공',
    type: Post,
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '게시물 등록' })
  @UseGuards(LoggedInGuard)
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @UserDecorator() user: UserProfile,
  ) {
    return await this.postService.create(user.id, createPostDto);
  }

  @ApiCreatedResponse({
    description: '게시물 수정 성공',
    type: ResponsePostWithCommentsDto,
  })
  @ApiNotFoundResponse({
    description: '게시물 존재 하지 않는 경우',
    schema: { example: '존재하지 않는 게시물입니다' },
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '게시물 아이디',
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '게시물 수정' })
  @UseGuards(LoggedInGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UserDecorator() user: UserProfile,
  ) {
    return await this.postService.update(+id, user.id, updatePostDto);
  }

  @ApiParam({
    name: 'id',
    required: true,
    description: '게시물 아이디',
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '게시물 추천' })
  @UseGuards(LoggedInGuard)
  @Patch('like/:id')
  async recommendPost(
    @Param('id') id: string,
    @UserDecorator() user: UserProfile,
  ) {
    return this.postService.like(+id, user.id);
  }

  //게시물 존재 및 게시물 권한 확인
  @ApiOperation({ summary: '게시물 이미지 삭제' })
  @Delete('image')
  async removeImage(@Query('key') key: string) {
    this.logger.log('key', key);
    s3.deleteObject(
      {
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: key,
      },
      function (err, data) {},
    );
  }

  @ApiParam({
    name: 'id',
    required: true,
    description: '게시물 아이디',
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '게시물 추천 취소' })
  @UseGuards(LoggedInGuard)
  @Delete('like/:id')
  async unrecommendPost(
    @Param('id') id: string,
    @UserDecorator() user: UserProfile,
  ) {
    return await this.postService.unlike(+id, user.id);
  }

  @ApiParam({
    name: 'id',
    required: true,
    description: '게시물 아이디',
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '게시물 삭제' })
  @UseGuards(LoggedInGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @UserDecorator() user: UserProfile) {
    return await this.postService.remove(+id, user.id);
  }
}
