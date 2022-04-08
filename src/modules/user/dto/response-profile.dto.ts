import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { Image, Profile } from 'src/entities';

export class ResponseProfileDto<ResponseProfile> extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => ProfileInfo })
  data: ResponseProfile;
}
export class ImageDto extends PickType(Image, [
  'id',
  'key',
  'location',
  'createdAt',
  'updatedAt',
]) {}

export class ProfileInfo extends PickType(Profile, [
  'id',
  'nickname',
  'selfIntroduction',
  'manner',
  'level',
  'exp',
  'userId',
  'createdAt',
  'updatedAt',
]) {
  @ApiProperty({ type: () => ImageDto })
  image?: ImageDto;
}
