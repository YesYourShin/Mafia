import { PickType } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';

export class JoinRequestUserDto extends PickType(User, [
  'provider',
  'socialId',
]) {}
