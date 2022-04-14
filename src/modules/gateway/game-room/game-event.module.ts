import { Logger, Module } from '@nestjs/common';
import { RedisModule } from 'src/modules/redis/redis.module';
import { RoomLimitationGuard } from '../guards/room-limitation.guard';
import { GameRoomEventService } from './game-room-event.service';
import { GameRoomGateway } from './game-room.gateway';
import { GameGateway } from './game.gateway';
import { GameEventService } from './game-event.service';

@Module({
  imports: [RedisModule],
  providers: [
    GameGateway,
    GameRoomGateway,
    GameRoomEventService,
    Logger,
    RoomLimitationGuard,
    GameEventService,
  ],
  exports: [
    GameGateway,
    GameRoomGateway,
    GameRoomEventService,
    GameEventService,
  ],
})
export class GameEventModule {}
