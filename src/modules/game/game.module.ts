import { Logger, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@svtslv/nestjs-ioredis';
@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: () => ({
        config: {
          url: 'redis://localhost:6379',
          db: +process.env.REDIS_GAME_DB,
        },
      }),
    }),
    ConfigModule,
  ],
  controllers: [GameController],
  providers: [GameService, Logger],
})
export class GameModule {}
