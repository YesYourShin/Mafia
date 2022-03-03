import { Inject, Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { parse } from 'cookie';

@Injectable()
export class GameService {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  async getUserFromSocket(socket: Socket) {
    const cookie = socket.handshake.headers.cookie;
  }
}
