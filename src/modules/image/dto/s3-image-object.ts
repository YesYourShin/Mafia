import { PickType } from '@nestjs/swagger';
import { Image } from 'src/entities';

export class S3ImageObject extends PickType(Image, [
  'originalname',
  'encoding',
  'mimetype',
  'size',
  'key',
  'location',
]) {
  constructor({
    originalname,
    encoding,
    mimetype,
    size,
    key,
    location,
  }: Express.MulterS3.File) {
    super();
    this.originalname = originalname;
    this.encoding = encoding;
    this.mimetype = mimetype;
    this.size = size;
    this.key = key;
    this.location = location;
  }
}
