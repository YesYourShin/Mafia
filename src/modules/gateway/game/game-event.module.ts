import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameRepository } from 'src/modules/game/game.repository';
import { RedisModule } from 'src/modules/redis/redis.module';
import { GameEventService } from './game-event.service';
import { GameGateway } from './game.gateway';

@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([GameRepository])],
  providers: [GameGateway, Logger, ConfigService, GameEventService],
  exports: [GameGateway, GameEventService],
})
export class GameEventModule {}
