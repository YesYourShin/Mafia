import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { Profile } from 'src/entities';
import { S3ImageObject } from 'src/modules/image/dto/s3-image-object';

export class UpdateProfileDto extends PickType(Profile, [
  'nickname',
  'selfIntroduction',
]) {
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  selfIntroduction?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({ type: () => S3ImageObject })
  image?: S3ImageObject;

  @IsOptional()
  @IsInt()
  imageId?: number;
}

export class UpdateProfileNoChangeImageDto extends PickType(Profile, [
  'nickname',
  'selfIntroduction',
]) {
  @IsString()
  nickname: string;

  @IsOptional()
  @IsString()
  selfIntroduction?: string;
}
