import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import RedisStore from 'connect-redis';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import helmet from 'helmet';
import hpp from 'hpp';
import Redis from 'ioredis';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import {
  ExcludeUndefinedInterceptor,
  TransformResponseInterceptor,
} from './interceptors';
import { ConfigService } from '@nestjs/config';
import { SessionAdapter } from './shared/adapter/SessionAdapter';
import { RedisIoAdapter } from './shared/adapter/RedisIoAdapter';

declare const module: any;

async function bootstrap() {
  //winston logger
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
        format: winston.format.combine(
          winston.format.timestamp(),
          nestWinstonModuleUtilities.format.nestLike('Mafia', {
            prettyPrint: true,
          }),
        ),
      }),
    ],
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
  });

  const configService = app.get(ConfigService);
  const PORT = process.env.PORT || 3065;

  //global setting
  app.setGlobalPrefix('/api');
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    // , new BaseWsExceptionFilter()
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new TransformResponseInterceptor(),
    new ExcludeUndefinedInterceptor(),
  );

  if (configService.get('NODE_ENV') === 'production') {
    app.enableCors({
      origin: 'https://gjgjajaj.xyz',
      credentials: true,
    });
    app.use(helmet());
    app.use(hpp());
    app.set('truxt proxy', 1);
  } else {
    app.enableCors({
      origin: true,
      credentials: true,
    });

    //swagger
    const config = new DocumentBuilder()
      .setTitle('Mafia API')
      .setDescription('Capstone Design - Mafia 개발을 위한 API 문서입니다.')
      .setVersion('1.0')
      .addCookieAuth('connect.sid')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/document', app, document);
  }

  //redis session store
  const redisClient = new Redis(
    `redis://${configService.get('REDIS_HOST')}:${configService.get(
      'REDIS_PORT',
    )}/${configService.get('REDIS_SESSION_DB')}`,
  );
  const redisStore = RedisStore(session);

  redisClient.on('error', function (err) {
    Logger.error('Could not establish a connection with redis. ' + err);
  });
  redisClient.on('connect', function (err) {
    Logger.log('Connected to redis successfully');
  });

  app.disable('etag');
  app.use(cookieParser());
  const sessionMiddleware = session({
    store: new redisStore({
      client: redisClient,
      logErrors: true,
      prefix: 'SESSION:',
    }),
    resave: false,
    saveUninitialized: false,
    secret: configService.get('COOKIE_SECRET'),
    proxy: configService.get('NODE_ENV') === 'production' && true,
    cookie: {
      sameSite: true,
      httpOnly: true,
      maxAge: +process.env.COOKIE_MAX_AGE,
      secure: configService.get('NODE_ENV') === 'production' ? true : false,
      domain: configService.get('NODE_ENV') === 'production' && '.gjgjajaj.xyz',
    },
  });
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  // websocket adapter -> redis adapter
  // const redisIoAdapter = new RedisIoAdapter(sessionMiddleware, app);
  // await redisIoAdapter.connectToRedis();
  // app.useWebSocketAdapter(redisIoAdapter);
  app.useWebSocketAdapter(new SessionAdapter(sessionMiddleware, app));

  await app.listen(PORT);
  console.log(`server listening on port ${PORT}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
