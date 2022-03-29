import { Logger, Module } from '@nestjs/common';
import { RedisModule } from 'src/modules/redis/redis.module';
import { GameRoomEventService } from './game-room-event.service';
import { GameRoomGateway } from './game-room.gateway';
import { GameGateway } from './game.gateway';

@Module({
  imports: [RedisModule],
  providers: [GameGateway, GameRoomGateway, GameRoomEventService, Logger],
  exports: [GameGateway, GameRoomGateway, GameRoomEventService],
})
export class GameEventModule {}
