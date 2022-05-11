import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { ProfileInfo } from '.';

export class FriendProfile {
  id: number;
  nickname: string;
  userId: number;
  selfIntroduction: string;
  level: number;
  image: {
    location: string;
  } | null;
  online?: boolean;
}

export class UserProfile extends PickType(User, [
  'id',
  'socialId',
  'provider',
  'role',
  'createdAt',
  'updatedAt',
]) {
  @ApiProperty({ type: () => ProfileInfo })
  profile?: ProfileInfo | null;

  @ApiProperty({ type: () => FriendProfile, isArray: true })
  friends?: FriendProfile[] | null;
}
