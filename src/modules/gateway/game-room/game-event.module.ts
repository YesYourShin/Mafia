import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JanusModule } from 'src/modules/janus/janus.module';
import { RedisModule } from 'src/modules/redis/redis.module';
import { GameEventService } from '../game/game-event.service';
import { GameGateway } from '../game/game.gateway';
import { RoomLimitationGuard } from '../guards/room-limitation.guard';
import { GameRoomEventService } from './game-room-event.service';
import { GameRoomGateway } from './game-room.gateway';

@Module({
  imports: [RedisModule, JanusModule],
  providers: [
    GameGateway,
    GameRoomGateway,
    GameRoomEventService,
    Logger,
    RoomLimitationGuard,
    ConfigService,
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
