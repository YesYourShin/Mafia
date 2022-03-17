import { PartialType } from '@nestjs/swagger';
import { CreateGameRoomDto } from './create-game-room.dto';

export class UpdateGameRoomDto extends PartialType(CreateGameRoomDto) {}
