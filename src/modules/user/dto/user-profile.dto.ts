import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from 'src/entities/User';
import { ProfileInfo } from '.';

export class UserProfile extends PickType(User, ['id', 'role']) {
  @ApiProperty({ type: () => ProfileInfo })
  profile: ProfileInfo;
}
