import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import express from 'express';
import passport from 'passport';
import { Server, ServerOptions, Socket } from 'socket.io';
export class SessionAdapter extends IoAdapter {
  private session: express.RequestHandler;
  constructor(app: INestApplicationContext, session: express.RequestHandler) {
    super(app);
    this.session = session;
  }

  create(port: number, options?: ServerOptions): Server {
    const server: Server = super.create(port, options);

    const wrap = (middleware: any) => (socket: Socket, next: any) =>
      middleware(socket.request, {}, next);

    server.use(wrap(this.session));
    server.use(wrap(passport.initialize()));
    server.use(wrap(passport.session()));
    return server;
  }
}
