import { PickType } from '@nestjs/swagger';
import { Profile } from 'src/entities/Profile';

export class ProfileInfo extends PickType(Profile, [
  'id',
  'nickname',
  'image',
  'selfIntroduction',
  'manner',
  'level',
  'exp',
  'userId',
]) {}
