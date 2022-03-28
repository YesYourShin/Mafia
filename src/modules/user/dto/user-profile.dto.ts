import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { ProfileInfo } from '.';

export class UserProfile extends PickType(User, [
  'id',
  'socialId',
  'provider',
  'role',
  'createdAt',
  'updatedAt',
]) {
  @ApiProperty({ type: () => ProfileInfo })
  profile: ProfileInfo;
}
