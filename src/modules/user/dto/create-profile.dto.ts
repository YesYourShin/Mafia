import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { Profile } from 'src/entities';
import { S3ImageObject } from 'src/modules/image/dto/s3-image-object';

export class CreateProfileDto extends PickType(Profile, [
  'nickname',
  'selfIntroduction',
]) {
  @ApiProperty({
    type: () => S3ImageObject,
    description: '등록할 image 객체',
  })
  image?: S3ImageObject;

  @IsOptional()
  @IsInt()
  imageId?: number;

  setImageId(imageId: number) {
    this.imageId = imageId;
  }
}
