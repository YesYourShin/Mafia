import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/entities/User';

export class JoinRequestUserDto extends PickType(User, [
  'provider',
  'socialId',
]) {}
