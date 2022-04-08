import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageRepository } from './image.repository';
import { ImagePostRepository } from './image-post.repository';
import { ImageService } from './image.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImageRepository, ImagePostRepository])],
  providers: [ImageService, ConfigService, Logger],
  exports: [ImageService],
})
export class ImageModule {}
