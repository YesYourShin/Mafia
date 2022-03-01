import { PickType } from '@nestjs/swagger';
import { Game } from 'src/entities/Game';

export class CreateGameDto extends PickType(Game, [
  'mode',
  'name',
  'password',
  'limit',
]) {
  gameNumber?: number;
}
