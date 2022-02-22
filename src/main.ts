import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import redis from 'redis';
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
import fs from 'fs';

declare const module: any;

async function bootstrap() {
  // ssh 설정
  // const httpsOptions = {
  //   key: fs.readFileSync(process.env.HTTPS_KEY, 'utf-8'),
  //   cert: fs.readFileSync(process.env.HTTPS_CERT, 'utf-8'),
  // };
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
    // httpsOptions,
  });
  const PORT = process.env.PORT || 3065;
  app.setGlobalPrefix('/api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: 'https://gjgjajaj.xyz',
      credentials: true,
    });
  } else {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  const config = new DocumentBuilder()
    .setTitle('Mafia API')
    .setDescription('Capstone Design - Mafia 개발을 위한 API 문서입니다.')
    .setVersion('1.0')
    .addCookieAuth('connect.sid')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/document', app, document);

  const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
    password: process.env.REDIS_PASSWORD,
  });
  const redisStore = RedisStore(session);

  redisClient.on('error', function (err) {
    Logger.error('Could not establish a connection with redis. ' + err);
  });
  redisClient.on('connect', function (err) {
    Logger.log('Connected to redis successfully');
  });

  app.use(cookieParser());
  app.use(
    session({
      store: new redisStore({
        client: redisClient,
        prefix: 'session:',
        logErrors: true,
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET,
      cookie: {
        sameSite: true,
        httpOnly: true,
        maxAge: +process.env.COOKIE_MAX_AGE,
        secure: false, // https일 경우 true로 변경해야 할 것
        // secure: true, // https일 경우 true로 변경해야 할 것
        domain: process.env.NODE_ENV === 'production' && 'gjgjajaj.xyz',
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
