import { BadRequestException } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import multerS3 from 'multer-s3';
import path from 'path';
import { s3 } from './s3';

export class PostMulterS3Service implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multerS3({
        bucket: process.env.AWS_S3_BUCKET,
        s3,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          cb(
            null,
            `original/posts/${Date.now()}_${path.basename(file.originalname)}`,
          );
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter(req, file, cb) {
        const mimetypes = ['image/jpg', 'image/jpeg', 'image/png'];
        if (mimetypes.includes(file.mimetype)) {
          return cb(null, true);
        }

        cb(new BadRequestException('이미지만 업로드 가능합니다'), false);
      },
    };
  }
}
