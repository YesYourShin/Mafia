import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JanusModule } from 'src/modules/janus/janus.module';
import { RedisModule } from 'src/modules/redis/redis.module';
import { RoomLimitationGuard } from '../guards/room-limitation.guard';
import { GameRoomEventService } from './game-room-event.service';
import { GameRoomGateway } from './game-room.gateway';
import { GameGateway } from './game.gateway';

@Module({
  imports: [RedisModule, JanusModule],
  providers: [
    GameGateway,
    GameRoomGateway,
    GameRoomEventService,
    Logger,
    RoomLimitationGuard,
    ConfigService,
  ],
  exports: [GameGateway, GameRoomGateway, GameRoomEventService],
})
export class GameEventModule {}
