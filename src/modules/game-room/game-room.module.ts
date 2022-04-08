import { Logger, Module } from '@nestjs/common';
import { GameRoomController } from './game-room.controller';
import { GameEventModule } from '../gateway/game-room/game-event.module';

@Module({
  imports: [GameEventModule],
  controllers: [GameRoomController],
  providers: [Logger],
  exports: [],
})
export class GameRoomModule {}
