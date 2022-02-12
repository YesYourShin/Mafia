import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from 'src/entities/User';
import { ProfileInfo } from './profile-info';

export class ResponseUserProfileDto extends PickType(User, ['id', 'role']) {
  @ApiProperty({ type: () => ProfileInfo })
  profile: ProfileInfo;
}
