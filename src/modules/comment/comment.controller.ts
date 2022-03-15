import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserDecorator } from 'src/decorators';
import { LoggedInGuard } from '../auth/guards';
import { UserProfile } from '../user/dto';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { CommentOwnerGuard } from './guards/comment-owner.guard';
import { ExistPostGuard } from '../post/guards';
import { ResponseCommentDto } from './dto/response-comment-dto';
import { ResponseDto } from 'src/common/dto';

@UseGuards(LoggedInGuard, ExistPostGuard)
@ApiTags('Comments')
@Controller('posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiCreatedResponse({
    description: '대댓글 작성 성공',
    type: ResponseCommentDto,
  })
  @ApiParam({
    name: 'parentId',
    description: '대댓글 부모 아이디',
  })
  @ApiOperation({ summary: '대댓글 등록' })
  @ApiCookieAuth('connect.sid')
  @ApiParam({
    description: '게시물 아이디',
    name: 'postId',
  })
  @Post(':parentId')
  async reply(
    @Body() createCommentDto: CreateCommentDto,
    @UserDecorator() user: UserProfile,
    @Param('postId') postId: string,
    @Param('parentId') parentId: string,
  ) {
    return await this.commentService.reply(
      +postId,
      +parentId,
      createCommentDto,
      user.id,
    );
  }
  @ApiOperation({ summary: '댓글 등록' })
  @ApiCookieAuth('connect.sid')
  @ApiParam({
    description: '게시물 아이디',
    name: 'postId',
  })
  @ApiCreatedResponse({
    description: '댓글 작성 성공',
    type: ResponseCommentDto,
  })
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @UserDecorator() user: UserProfile,
    @Param('postId') postId: string,
  ) {
    return await this.commentService.create(+postId, createCommentDto, user.id);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @ApiCookieAuth('connect.sid')
  @ApiParam({
    name: 'id',
    example: 1,
    description: '댓글 아이디',
  })
  @ApiParam({
    description: '게시물 아이디',
    name: 'postId',
  })
  @ApiOkResponse({
    description: '댓글 수정 성공',
    type: ResponseCommentDto,
  })
  @UseGuards(CommentOwnerGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return await this.commentService.update(+id, updateCommentDto);
  }

  @ApiOkResponse({
    description: '댓글 삭제 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.OK, {
        commentId: 1,
        delete: true,
      }),
    },
  })
  @ApiParam({
    description: '게시물 아이디',
    name: 'postId',
  })
  @ApiParam({
    name: 'id',
    example: 1,
    description: '댓글 아이디',
  })
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiCookieAuth('connect.sid')
  @UseGuards(CommentOwnerGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.commentService.remove(+id);
  }
}
