import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import express from 'express';
import Redis from 'ioredis';
import { INestApplicationContext } from '@nestjs/common';
import passport from 'passport';
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private session: express.RequestHandler;
  constructor(session: any, app: INestApplicationContext) {
    super(app);
    this.session = session;
  }

  async connectToRedis(): Promise<void> {
    const pubClient = new Redis(
      `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_SESSION_DB}`,
    );

    const subClient = pubClient.duplicate();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);

    const wrap = (middleware: any) => (socket: Socket, next: any) =>
      middleware(socket.request, {}, next);

    server.use(wrap(this.session));
    server.use(wrap(passport.initialize()));
    server.use(wrap(passport.session()));

    return server;
  }
}
