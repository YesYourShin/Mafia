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
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { LoggedInGuard } from '../auth/guards/logged-in.guard';
import { UserDecorator } from 'src/decorators/user.decorator';
import { User } from 'src/entities/User';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: '게시물 자세히 보기' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.postService.findOne(+id);
  }

  @ApiOperation({ summary: '전체 게시물 보기' })
  @Get()
  async findAll(
    @Query('category') categoryId: string,
    @Query('skip') skip: string,
  ) {
    return await this.postService.findAll(+categoryId, +skip);
  }

  @ApiOperation({ summary: '이미지들 저장' })
  @UseGuards(LoggedInGuard)
  @Post('images')
  async saveImage() {}

  @ApiOperation({ summary: '게시물 등록' })
  @UseGuards(LoggedInGuard)
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @UserDecorator() user: User,
  ) {
    return await this.postService.create(user.id, createPostDto);
  }

  @ApiOperation({ summary: '게시물 수정' })
  @UseGuards(LoggedInGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UserDecorator() user: User,
  ) {
    return await this.postService.update(+id, user.id, updatePostDto);
  }

  @ApiOperation({ summary: '게시물 추천' })
  @UseGuards(LoggedInGuard)
  @Patch('recommend/:id')
  async recommendPost(@Param('id') id: string, @UserDecorator() user: User) {}

  @ApiOperation({ summary: '게시물 추천 취소' })
  @UseGuards(LoggedInGuard)
  @Delete('unrecommend/:id')
  async unrecommendPost(@Param('id') id: string, @UserDecorator() user: User) {}

  @ApiOperation({ summary: '게시물 삭제' })
  @UseGuards(LoggedInGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.postService.remove(+id);
  }
}
