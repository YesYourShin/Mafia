import { Logger, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from './post.repository';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { CommentRepository } from '../comment/comment.repository';
import { PostMulterS3Service } from 'src/shared/post-multer-s3.service';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostRepository, CommentRepository]),
    MulterModule.registerAsync({
      useClass: PostMulterS3Service,
    }),
    ImageModule,
  ],
  controllers: [PostController],
  providers: [PostService, Logger, ConfigService],
})
export class PostModule {}
