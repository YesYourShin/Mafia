import { Logger, Module } from '@nestjs/common';
import { GameModule } from '../game/game.module';
import { GameMessageGateway } from './game/game-message.gateway';
import { UserMessageGateway } from './user/user-message.gateway';

@Module({
  imports: [GameModule],
  providers: [GameMessageGateway, UserMessageGateway, Logger],
  exports: [GameMessageGateway, UserMessageGateway],
})
export class EventModule {}
