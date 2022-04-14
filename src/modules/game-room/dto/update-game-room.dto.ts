import { PickType } from '@nestjs/swagger';
import { GameRoom } from './game-room';

export class UpdateGameRoomDto extends PickType(GameRoom, [
  'id',
  'mode',
  'pin',
  'description',
  'publishers',
  'room',
] as const) {}
