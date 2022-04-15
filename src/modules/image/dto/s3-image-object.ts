import { ApiOperation, ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
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

export class ResponseS3ImageObject extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => S3ImageObject })
  data: S3ImageObject;
}
