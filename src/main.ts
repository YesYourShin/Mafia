import { ValidationPipe } from '@nestjs/common';
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
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const PORT = process.env.PORT || 3065;
  app.setGlobalPrefix('/api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Mafia API')
    .setDescription('Capstone Design - Mafia 개발을 위한 API 문서입니다.')
    .setVersion('1.0')
    .addCookieAuth('connect.sid')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/document', app, document);

  const redisClient = redis.createClient({
    host: 'localhost',
    port: process.env.REDIS_PORT,
  });
  const redisStore = RedisStore(session);

  redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err);
  });
  redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully');
  });

  app.use(cookieParser());
  app.use(
    session({
      store: new redisStore({
        client: redisClient,
        logErrors: true,
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET,
      cookie: {
        sameSite: true,
        httpOnly: true,
        maxAge: +process.env.COOKIE_MAX_AGE,
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
