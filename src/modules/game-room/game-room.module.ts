import { Logger, Module } from '@nestjs/common';
import { GameRoomService } from './game-room.service';
import { GameRoomController } from './game-room.controller';
import { GameEventModule } from '../gateway/game-room/game-event.module';

@Module({
  imports: [GameEventModule],
  controllers: [GameRoomController],
  providers: [GameRoomService, Logger],
  exports: [GameRoomService],
})
export class GameRoomModule {}
