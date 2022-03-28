import { Logger, Module } from '@nestjs/common';
import { RedisModules } from 'src/modules/redis/redis.modules';
import { GameRoomEventService } from './game-room-event.service';
import { GameRoomGateway } from './game-room.gateway';

@Module({
  imports: [RedisModules],
  providers: [GameRoomGateway, GameRoomEventService, Logger],
  exports: [GameRoomGateway, GameRoomEventService],
})
export class GameRoomEventModule {}
