import { BadRequestException } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import path from 'path';

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION,
});

export class MulterS3Service implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multerS3({
        bucket: process.env.AWS_S3_BUCKET,
        s3,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          cb(
            null,
            `original/${Date.now()}_${path.basename(file.originalname)}`,
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
