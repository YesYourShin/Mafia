import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { GameModule } from './modules/game/game.module';
import { NotificationModule } from './modules/notification/notification.module';
import { EventModule } from './modules/event/event.module';
import * as ormconfig from '../ormconfig';

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
    GameModule,
    NotificationModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumenr: MiddlewareConsumer): any {
    consumenr.apply(LoggerMiddleware).forRoutes('*');
  }
}
