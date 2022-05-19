import { Logger, Module } from '@nestjs/common';
import { GameRoomController } from './game-room.controller';
import { ConfigService } from '@nestjs/config';
import { NotificationModule } from '../notification/notification.module';
import { GameRoomService } from './game-room.service';
import { UserEventModule } from '../gateway/user/user-event.module';
import { GameRoomEventModule } from '../gateway/game-room/game-room-event.module';

@Module({
  imports: [GameRoomEventModule, NotificationModule, UserEventModule],
  controllers: [GameRoomController],
  providers: [Logger, ConfigService, GameRoomService],
  exports: [],
})
export class GameRoomModule {}
