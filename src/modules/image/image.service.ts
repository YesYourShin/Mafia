import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AWSError, S3 } from 'aws-sdk';
import { promiseAllSetteldResult } from 'src/shared/promise-all-settled-result';
import { s3 } from 'src/shared/s3';
import { QueryRunner } from 'typeorm';
import { ImageRemoveOptions } from './constants/image-remove-options';
import { ResponseImage } from './constants/response-image';
import { S3ImageObject } from './dto/s3-image-object';
import { ImagePostRepository } from './image-post.repository';
import { ImageRepository } from './image.repository';

@Injectable()
export class ImageService {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly imagePostRepository: ImagePostRepository,
    private readonly configService: ConfigService,
    @Inject(Logger) private readonly logger = new Logger('ImageService'),
  ) {}

  async findByPostId(postId: number) {
    return await this.imageRepository.findByPostId(postId);
  }
  async findOne(imageId: number): Promise<ResponseImage> {
    return await this.imageRepository.findOne(imageId);
  }
  async findByKey(key: string | string[]) {
    return await this.imageRepository.findByKey(key);
  }
  async findByLocation(location: string | string[]) {
    return await this.imageRepository.findByLocation(location);
  }

  async save(image: S3ImageObject, queryRunner?: QueryRunner): Promise<number> {
    const newImage = await this.imageRepository.save(image, queryRunner);
    return newImage.identifiers[0].id;
  }

  async saveImagePost(
    postId: number,
    imageId: number | number[],
    queryRunner?: QueryRunner,
  ) {
    return await this.imagePostRepository.save(postId, imageId, queryRunner);
  }

  async remove(options: ImageRemoveOptions, queryRunner?: QueryRunner) {
    return await this.imageRepository.remove(options, queryRunner);
  }
  async deleteS3Objects(keys: string[]) {
    const deleteImages = [];
    for (const key of keys) {
      deleteImages.push(this.deleteS3Object(key));
    }
    const { value, reason } = await promiseAllSetteldResult(deleteImages);

    if (reason?.length) {
      this.logger.error('error when delete s3 objects', reason);
    }

    return value;
  }
  deleteS3Object(key: string): Promise<S3.Types.DeleteObjectOutput> {
    return new Promise((resolve, reject) => {
      s3.deleteObject(
        {
          Bucket: this.configService.get('AWS_S3_BUCKET'),
          Key: key,
        },
        (err: AWSError, data: S3.Types.DeleteObjectOutput) => {
          if (err) {
            reject(err);
          }
          resolve(data);
        },
      );
    });
  }
}
