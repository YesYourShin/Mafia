import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { User } from 'src/entities/user.entity';
import { ProfileInfo } from '.';

export class FriendProfile {
  @ApiProperty({
    example: 1,
    description: '프로필 고유 ID',
  })
  id: number;

  @ApiProperty({
    example: 'gjgjajaj',
    description: '닉네임',
  })
  nickname: string;

  @ApiProperty({
    example: 1,
    description: '유저 ID',
  })
  userId: number;

  @ApiProperty({
    example: '안녕하세요 OOO입니다.',
    description: '한줄 소개',
    required: false,
  })
  selfIntroduction: string | null;

  @ApiProperty({
    example: 3,
    description: '게임 레벨',
  })
  level: number;

  @ApiProperty({
    example: {
      location: 'https://***.**.**.com/original/**/1649000570209_**.PNG',
    },
    description: '파일 경로',
  })
  image: {
    location: string;
  } | null;

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
