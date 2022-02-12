import { PickType } from '@nestjs/swagger';
import { Profile } from 'src/entities/Profile';

export class CreateProfileDto extends PickType(Profile, [
  'nickname',
  'image',
  'selfIntroduction',
]) {}
