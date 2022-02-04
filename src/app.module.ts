import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormconfig } from '../ormconfig';
import { MessageModule } from './event/message.module';
import { UserModule } from './modules/user/user.module';
import { OAuthModule } from './modules/auth/oauth.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';

export let envFilePath = '.env.development';

if (process.env.NODE_ENV === 'production') {
  envFilePath = '.env.production';
} else if (process.env.NODE_ENV === 'test') {
  envFilePath = '.env.testing';
}
console.log(envFilePath);
console.log(process.env.NODE_ENV);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(ormconfig),
    MessageModule,
    OAuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumenr: MiddlewareConsumer): any {
    consumenr.apply(LoggerMiddleware).forRoutes('*');
  }
}
