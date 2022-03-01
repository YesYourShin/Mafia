import { Logger, Module } from '@nestjs/common';
import { GameMessageGateway } from './game/game-message.gateway';
import { UserMessageGateway } from './user/user-message.gateway';

@Module({
  providers: [GameMessageGateway, UserMessageGateway, Logger],
  exports: [GameMessageGateway, UserMessageGateway],
})
export class EventModule {}
