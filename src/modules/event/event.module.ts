import { Logger, Module } from '@nestjs/common';
import { GameRoomEventService } from './game-room/game-room-event.service';
import { GameRoomGateway } from './game-room/game-room.gateway';
import { UserGateway } from './user/user.gateway';

@Module({
  providers: [GameRoomGateway, UserGateway, Logger, GameRoomEventService],
  exports: [GameRoomGateway, UserGateway],
})
export class EventModule {}
