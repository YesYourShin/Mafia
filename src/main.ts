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
import Redis from 'ioredis';
import {
  ExcludeUndefinedInterceptor,
  TransformResponseInterceptor,
} from './interceptors';
import { RedisIoAdapter } from './shared/adapter/RedisIoAdapter';
import { ConfigService } from '@nestjs/config';

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
  app.useGlobalFilters(new HttpExceptionFilter());
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

  // websocket adapter -> redis adapter
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  app.use(cookieParser());
  app.use(
    session({
      store: new redisStore({
        client: redisClient,
        logErrors: true,
        prefix: 'SESSION:',
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET,
      cookie: {
        sameSite: true,
        httpOnly: true,
        maxAge: +process.env.COOKIE_MAX_AGE,
        secure: configService.get('NODE_ENV') === 'production' ? true : false,
        domain:
          configService.get('NODE_ENV') === 'production' && 'gjgjajaj.xyz',
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(PORT);
  console.log(`server listening on port ${PORT}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
