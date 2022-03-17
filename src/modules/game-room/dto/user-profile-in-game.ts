import { PickType } from '@nestjs/swagger';
import { Profile } from 'src/entities/Profile';

export class UserProfileInGame extends PickType(Profile, [
  'id',
  'nickname',
  'image',
  'level',
  'userId',
]) {}
