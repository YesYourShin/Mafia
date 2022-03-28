import { PickType } from '@nestjs/swagger';
import { Profile } from 'src/entities';
import { ProfileInfo } from 'src/modules/user/dto';

export class Member extends PickType(Profile, [
  'id',
  'nickname',
  'image',
  'level',
  'userId',
]) {
  // constructor로 한번에 setting code 짤 것
  constructor({ id, nickname, image, level, userId }: ProfileInfo) {
    super();
    this.id = id;
    this.nickname = nickname;
    this.image = image;
    this.level = level;
    this.userId = userId;
  }
}
