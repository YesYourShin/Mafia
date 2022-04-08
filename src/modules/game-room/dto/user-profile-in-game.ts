import { ApiProperty, PickType } from '@nestjs/swagger';
import { ImageDto, ProfileInfo } from 'src/modules/user/dto';

export class Member extends PickType(ProfileInfo, [
  'id',
  'nickname',
  'level',
  'userId',
]) {
  @ApiProperty({ type: () => ImageDto })
  image?: ImageDto;

  @ApiProperty({
    name: 'ready',
    example: true,
  })
  ready?: boolean;

  constructor({ id, nickname, image, level, userId }: ProfileInfo) {
    super();
    this.id = id;
    this.nickname = nickname;
    this.image = image;
    this.level = level;
    this.userId = userId;
  }
}
