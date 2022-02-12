import { PickType } from '@nestjs/swagger';
import { User } from 'src/entities/User';

export class JoinRequestUserDto extends PickType(User, [
  'provider',
  'socialId',
]) {}
