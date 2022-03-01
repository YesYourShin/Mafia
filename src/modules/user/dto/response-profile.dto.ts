import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { Profile } from 'src/entities/Profile';

export class ResponseProfileDto<ResponseProfile> extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => ProfileInfo })
  data: ResponseProfile;
}
export class ProfileInfo extends PickType(Profile, [
  'id',
  'nickname',
  'image',
  'selfIntroduction',
  'manner',
  'level',
  'exp',
  'userId',
  'createdAt',
  'updatedAt',
]) {}
