import { Logger, Module } from '@nestjs/common';
import { GameRoomController } from './game-room.controller';
import { GameEventModule } from '../gateway/game-room/game-event.module';
import { ConfigService } from '@nestjs/config';
import { NotificationModule } from '../notification/notification.module';
import { GameRoomService } from './game-room.service';
import { UserEventModule } from '../gateway/user/user-event.module';

@Module({
  imports: [GameEventModule, NotificationModule, UserEventModule],
  controllers: [GameRoomController],
  providers: [Logger, ConfigService, GameRoomService],
  exports: [],
})
export class GameRoomModule {}
