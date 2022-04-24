import { ApiProperty } from '@nestjs/swagger';
import { ImageDto } from 'src/modules/user/dto';
import { Member } from './member';

export class Player {
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

  @ApiProperty({ type: () => ImageDto })
  image?: ImageDto | null;

  @ApiProperty({
    example: 3,
    description: '게임 레벨',
  })
  level: number;

  @ApiProperty({
    example: 1,
    description: '유저 ID',
  })
  userId: number;

  @ApiProperty({
    example: 'citizen',
    description: '직업',
  })
  job: string;

  @ApiProperty({
    example: false,
    description: '생존 상태',
  })
  die: boolean;

  constructor(member: Member) {
    this.id = member.id;
    this.nickname = member.nickname;
    this.image = member?.image || null;
    this.level = member.level;
    this.userId = member.userId;
    this.job = null;
    this.die = false;
  }
}
