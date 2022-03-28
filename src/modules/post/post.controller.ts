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
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { s3 } from 'src/shared/multer-s3.service';
import {
  CreatePostDto,
  FindAllResponseDto,
  FindOneResponseDto,
  UpdatePostDto,
} from './dto';
import { UserProfile } from '../user/dto';
import { LoggedInGuard } from '../auth/guards';
import { ApiFile, UserDecorator } from 'src/decorators';
import { ExistedProfileGuard } from 'src/common/guards';
import { CategoryRangeGuard, ExistPostGuard } from './guards';
import { PostOwnerGuard } from './guards/post-owner.guard';
import { ResponseDto } from 'src/common/dto';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOkResponse({
    description: '게시물 하나 상세 보기',
    type: FindOneResponseDto,
  })
  @ApiParam({
    name: 'postId',
    required: true,
    description: '게시물 아이디',
  })
  @ApiOperation({ summary: '게시물 하나 상세 보기' })
  @UseGuards(ExistPostGuard)
  @Get(':postId')
  async findOne(@Param('postId') id: string) {
    return await this.postService.findOne(+id);
  }

  @ApiOkResponse({
    description: '게시물들 불러오기',
    type: FindAllResponseDto,
  })
  @ApiOperation({ summary: '게시물들 불러오기' })
  @UseGuards(CategoryRangeGuard)
  @Get()
  async findAll(
    @Query('category') category: string,
    @Query('page') page: string,
  ) {
    return await this.postService.findAll(+category, +page);
  }

  @ApiFile('image')
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '이미지 저장' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(LoggedInGuard, ExistedProfileGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() file: Express.MulterS3.File) {
    return await this.postService.uploadImage(file);
  }

  @ApiCreatedResponse({
    description: '게시물 등록 성공',
    type: FindOneResponseDto,
  })
  @ApiBody({
    type: CreatePostDto,
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
    type: FindOneResponseDto,
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
  @ApiBody({
    type: UpdatePostDto,
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '게시물 수정' })
  @UseGuards(LoggedInGuard, ExistedProfileGuard, ExistPostGuard, PostOwnerGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch(':postId')
  async update(
    @Param('postId') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return await this.postService.update(+id, updatePostDto);
  }

  @ApiOkResponse({
    description: '게시물 추천 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.OK, { postId: 1, like: true }),
    },
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '게시물 아이디',
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '게시물 추천' })
  @UseGuards(LoggedInGuard, ExistedProfileGuard)
  @Patch('like/:postId')
  async likePost(
    @Param('postId') id: string,
    @UserDecorator() user: UserProfile,
  ) {
    return await this.postService.like(+id, user.id);
  }

  @ApiOperation({ summary: '게시물 이미지 삭제' })
  @ApiQuery({
    description: 'image 경로',
    name: 'image',
    example: 'original/abc.jpg',
  })
  @UseGuards(LoggedInGuard, ExistedProfileGuard)
  @Delete('image')
  async removeImage(@Query('image') key: string) {
    this.logger.log('key', key);
    s3.deleteObject(
      {
        Bucket: this.configService.get('AWS_S3_BUCKET'),
        Key: key,
      },
      function (err, data) {},
    );
  }

  @ApiOkResponse({
    description: '게시물 추천 취소 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.OK, {
        postId: 1,
        unlike: true,
      }),
    },
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '게시물 아이디',
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '게시물 추천 취소' })
  @UseGuards(LoggedInGuard, ExistedProfileGuard, ExistPostGuard)
  @Delete('like/:postId')
  async unlikePost(
    @Param('postId') id: string,
    @UserDecorator() user: UserProfile,
  ) {
    return await this.postService.unlike(+id, user.id);
  }

  @ApiOkResponse({
    description: '게시물 삭제 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.OK, {
        postId: 1,
        delete: true,
      }),
    },
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: '게시물 아이디',
  })
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '게시물 삭제' })
  @UseGuards(LoggedInGuard, ExistedProfileGuard, ExistPostGuard, PostOwnerGuard)
  @Delete(':postId')
  async remove(@Param('postId') id: string) {
    return await this.postService.remove(+id);
  }
}
