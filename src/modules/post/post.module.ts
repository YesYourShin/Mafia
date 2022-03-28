import { Logger, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from './post.repository';
import { ImageRepository } from './image.repository';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { MulterS3Service } from 'src/shared/multer-s3.service';
import { CommentRepository } from '../comment/comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PostRepository,
      ImageRepository,
      CommentRepository,
    ]),
    MulterModule.registerAsync({ useClass: MulterS3Service }),
  ],
  controllers: [PostController],
  providers: [PostService, Logger, ConfigService],
})
export class PostModule {}
