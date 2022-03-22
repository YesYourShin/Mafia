import { PickType } from '@nestjs/swagger';
import { Profile } from 'src/entities/Profile';
import { ProfileInfo } from 'src/modules/user/dto';

export class UserProfileInGame extends PickType(Profile, [
  'id',
  'nickname',
  'image',
  'level',
  'userId',
]) {
  // constructor로 한번에 setting code 짤 것
  static profile(profile: ProfileInfo) {
    const { id, nickname, image, level, userId } = profile;
    return {
      id,
      nickname,
      image,
      level,
      userId,
    };
  }
}
