import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRepository } from './comment.repository';
import { PostRepository } from '../post/post.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CommentRepository, PostRepository])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
