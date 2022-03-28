import { Logger, Module } from '@nestjs/common';
import { GameRoomService } from './game-room.service';
import { GameRoomController } from './game-room.controller';
import { GameRoomEventModule } from '../gateway/game-room/game-room-event.module';

@Module({
  imports: [GameRoomEventModule],
  controllers: [GameRoomController],
  providers: [GameRoomService, Logger],
  exports: [GameRoomService],
})
export class GameRoomModule {}
