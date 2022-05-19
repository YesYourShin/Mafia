import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameRepository } from 'src/modules/game/game.repository';
import { JanusModule } from 'src/modules/janus/janus.module';
import { RedisModule } from 'src/modules/redis/redis.module';
import { RoomLimitationGuard } from '../guards/room-limitation.guard';
import { GameRoomEventService } from './game-room-event.service';
import { GameRoomGateway } from './game-room.gateway';

@Module({
  imports: [
    RedisModule,
    JanusModule,
    TypeOrmModule.forFeature([GameRepository]),
  ],
  providers: [
    GameRoomGateway,
    GameRoomEventService,
    Logger,
    RoomLimitationGuard,
    ConfigService,
  ],
  exports: [GameRoomGateway, GameRoomEventService],
})
export class GameRoomEventModule {}
