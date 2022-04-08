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
  Inject,
  Logger,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import {
  ApiBadRequestResponse,
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
import { ImageService } from '../image/image.service';
import { CategoryEnum } from 'src/common/constants';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly imageService: ImageService,
    @Inject(Logger) private readonly logger = new Logger('PostController'),
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
  async findOne(
    @Param('postId') id: string,
    @UserDecorator() user?: UserProfile,
  ) {
    return await this.postService.findOne(+id, user?.id);
  }

  @ApiQuery({
    description: 'defalut 4 / 전체 게시판',
    name: 'category',
    example: 'api/posts?category=1',
    schema: {
      default: 4,
    },
  })
  @ApiQuery({
    description: 'default 1 / 1페이지',
    name: 'page',
    example: 'api/posts?page=1',
    schema: {
      default: 1,
    },
  })
  @ApiOkResponse({
    description: '게시물들 불러오기',
    type: FindAllResponseDto,
  })
  @ApiOperation({ summary: '게시물들 불러오기' })
  @UseGuards(CategoryRangeGuard)
  @Get()
  async findAll(
    @Query('category', new DefaultValuePipe(CategoryEnum.GENERAL), ParseIntPipe)
    category: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return await this.postService.findAll(category, page);
  }

  @ApiCreatedResponse({
    description: '프로필 이미지 저장 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.CREATED, {
        location: 'https://aaa.com/cat.jpg',
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
  @ApiFile('image')
  @ApiCookieAuth('connect.sid')
  @ApiOperation({ summary: '이미지 저장' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(LoggedInGuard, ExistedProfileGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(@UploadedFile() image: Express.MulterS3.File) {
    const imageId = await this.imageService.save(image);
    return await this.imageService.findOne(imageId);
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
    const id = await this.postService.create(user.id, createPostDto);
    return await this.postService.findOne(id);
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
    await this.postService.update(+id, updatePostDto);
    return await this.postService.findOne(+id);
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
  async removeImage(@Body('images') keys: string[]) {
    return await this.postService.removeImage(keys);
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
