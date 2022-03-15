import { Logger, Module } from '@nestjs/common';
import { GameGateway } from './game/game.gateway';
import { UserMessageGateway } from './user/user-message.gateway';

@Module({
  imports: [],
  providers: [GameGateway, UserMessageGateway, Logger],
  exports: [GameGateway, UserMessageGateway],
})
export class EventModule {}
