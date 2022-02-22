import { ApiProperty, PickType } from '@nestjs/swagger';
import { Profile } from 'src/entities/Profile';
import { User } from 'src/entities/User';
import { ProfileInfo } from './profile-info';

export class ResponseUserProfileDto extends PickType(User, ['id', 'role']) {
  @ApiProperty({ type: () => ProfileInfo })
  profile: ProfileInfo;
}

export class ResponseProfileDto extends PickType(Profile, [
  'id',
  'nickname',
  'image',
  'selfIntroduction',
  'manner',
  'level',
  'exp',
  'userId',
]) {}
