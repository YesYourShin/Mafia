import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule as RedisRegisterModule } from '@svtslv/nestjs-ioredis';
import { REDIS_GAME } from '.';
import { RedisGameService } from './redis-game.service';
import { REDIS_CHAT } from './redis-option';

@Module({
  imports: [
    RedisRegisterModule.forRootAsync(
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
    RedisRegisterModule.forRootAsync(
      {
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          config: {
            url: `redis://${configService.get(
              'REDIS_HOST',
            )}:${configService.get('REDIS_PORT')}/${configService.get(
              'REDIS_CHAT_DB',
            )}`,
          },
        }),
      },
      REDIS_CHAT,
    ),
    ConfigModule,
  ],
  providers: [RedisGameService],
  exports: [RedisGameService],
})
export class RedisModule {}
