import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}
  async create(
    postId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const result = await this.commentRepository.create(
      postId,
      createCommentDto,
      userId,
    );
    return await this.commentRepository.findOne(result.identifiers[0].id);
  }

  async reply(
    postId: number,
    parentId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const comment = await this.commentRepository.findOne(parentId);
    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다');
    }
    const result = await this.commentRepository.reply(
      postId,
      parentId,
      createCommentDto,
      userId,
    );
    return await this.commentRepository.findOne(result.identifiers[0].id);
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    await this.commentRepository.update(id, updateCommentDto);
    return await this.commentRepository.findOne(id);
  }

  async remove(id: number) {
    await this.commentRepository.remove(id);
    return { commentId: id, delete: true };
  }
}
