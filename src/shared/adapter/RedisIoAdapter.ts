import { IoAdapter } from '@nestjs/platform-socket.io';
import { RedisClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter } from 'socket.io-redis';

export class RedisIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    const pubClient = new RedisClient({ host: 'localhost', port: 6379 });
    const subClient = pubClient.duplicate();
    const redisAdapter = createAdapter({ pubClient, subClient });
    server.adapter(redisAdapter);
    return server;
  }
}
