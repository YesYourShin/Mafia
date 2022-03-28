import { PickType } from '@nestjs/swagger';
import { Game } from 'src/entities';

export class CreateGameRoomDto extends PickType(Game, [
  'mode',
  'name',
  'password',
  'limit',
]) {
  gameRoomNumber?: number;
}
