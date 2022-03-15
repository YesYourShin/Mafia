import { Logger, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@svtslv/nestjs-ioredis';
import { EventModule } from '../event/event.module';
import { REDIS_GAME } from '../redis';

@Module({
  imports: [
    RedisModule.forRootAsync(
      {
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          config: {
            url: `redis://${configService.get(
              'REDIS_HOST',
            )}:${configService.get('REDIS_PORT')}/${configService.get(
              'REDIS_GAME_DB',
            )}`,
          },
        }),
      },
      REDIS_GAME,
    ),
    ConfigModule,
    EventModule,
  ],
  controllers: [GameController],
  providers: [GameService, Logger],
  exports: [GameService],
})
export class GameModule {}
