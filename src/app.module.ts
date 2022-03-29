import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { GameRoomModule } from './modules/game-room/game-room.module';
import { NotificationModule } from './modules/notification/notification.module';
import { GameModule } from './modules/game/game.module';
import * as ormconfig from '../ormconfig';
import { RedisModule } from './modules/redis/redis.module';
import { GameEventModule } from './modules/gateway/game-room/game-event.module';
import { UserEventModule } from './modules/gateway/user/user-event.module';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : process.env.NODE_ENV === 'testing'
          ? '.env.testing'
          : '.env.development',
    }),
    TypeOrmModule.forRoot(ormconfig),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
    GameEventModule,
    GameRoomModule,
    NotificationModule,
    GameModule,
    RedisModule,
    UserEventModule,
    TerminusModule,
    HttpModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumenr: MiddlewareConsumer): any {
    consumenr.apply(LoggerMiddleware).forRoutes('*');
  }
}
