import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { Image } from 'src/entities';

class UserImage extends PickType(Image, ['location', 'originalname']) {}

export class FindUserByNickname {
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
    example: 3,
    description: '게임 레벨',
  })
  level: number;
  @ApiProperty({
    example: 1,
    description: '유저 아이디',
  })
  userId: number;
  @ApiProperty({ type: () => UserImage })
  image: UserImage | null;

  @ApiProperty({ example: true, description: 'online' })
  online?: boolean;
}

export class ResponseFindUserByNickname extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => FindUserByNickname })
  data: FindUserByNickname;
}
