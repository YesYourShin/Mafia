import { Logger, Module } from '@nestjs/common';
import { RedisModules } from 'src/modules/redis/redis.modules';
import { GameRoomEventService } from './game-room-event.service';
import { GameRoomGateway } from './game-room.gateway';
import { GameGateway } from './game.gateway';

@Module({
  imports: [RedisModules],
  providers: [GameGateway, GameRoomGateway, GameRoomEventService, Logger],
  exports: [GameGateway, GameRoomGateway, GameRoomEventService],
})
export class GameEventModule {}
