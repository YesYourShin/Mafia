import { Logger, Module } from '@nestjs/common';
import { GameRoomController } from './game-room.controller';
import { GameEventModule } from '../gateway/game-room/game-event.module';
import { ConfigService } from '@nestjs/config';
import { JanusModule } from '../janus/janus.module';

@Module({
  imports: [GameEventModule],
  controllers: [GameRoomController],
  providers: [Logger, ConfigService],
  exports: [],
})
export class GameRoomModule {}
