import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { Profile } from 'src/entities';
import { User } from 'src/entities/user.entity';
import { ProfileInfo } from '.';
import { ImageDto } from './response-profile.dto';

export class FriendProfile extends PickType(Profile, [
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

  @ApiProperty({
    example: true,
    description: '온라인 여부',
  })
  online?: boolean;
}

class FindFriendDto {
  @ApiProperty({ type: FriendProfile, isArray: true })
  friends: FriendProfile[];
}

export class ResponseFindFriendDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: FindFriendDto })
  data: FindFriendDto;
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
