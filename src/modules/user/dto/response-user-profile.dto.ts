import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { UserProfile } from './user-profile.dto';

export class ResponseUserProfileDto<ResponseUserProfile> extends PickType(
  ResponseDto,
  ['success', 'status', 'data'],
) {
  @ApiProperty({ type: () => ResponseUserProfile })
  data: ResponseUserProfile;
}

class ResponseUserProfile extends PickType(UserProfile, [
  'id',
  'socialId',
  'provider',
  'role',
  'createdAt',
  'updatedAt',
  'profile',
]) {}
