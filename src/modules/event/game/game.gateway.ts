import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectRedis, Redis } from '@svtslv/nestjs-ioredis';
import { Server, Socket } from 'socket.io';
import { GamePrefix } from 'src/modules/game/constants';
import { UserProfileInGame } from 'src/modules/game/dto';
import { REDIS_GAME } from 'src/modules/redis';
import { UserProfile } from 'src/modules/user/dto';
import { Event } from './constants';

@WebSocketGateway({
  // path: '/socket.io' <- defaut path,
  transports: ['websocket'],
  cors: { origin: '*' },
  namespace: /\/game-.+/,
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @InjectRedis(REDIS_GAME) private readonly redis: Redis, // private readonly gameService: GameService,
  ) {}
  @WebSocketServer() public server: Server;

  @SubscribeMessage(Event.JOIN)
  async handleJoin(
    @MessageBody() data: { user: UserProfile; gameNumber: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const newNamespace = socket.nsp;
    socket.join(`${socket.nsp.name}-${data.gameNumber}`);
    // const members = await this.gameService.findMembers(data.gameNumber);
    // newNamespace.emit(Event.ONLINELIST, members);
  }
  @SubscribeMessage(Event.READY)
  async handleReady(
    @MessageBody() data: { user: UserProfile; gameNumber: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = JSON.stringify(data.user);
    const newNamespace = socket.nsp;
    const isReady = await this.redis.sismember(
      `game:ready#${socket.nsp.name}`,
      user,
    );
    if (!isReady) {
      await this.redis.sadd(`game:ready#${socket.nsp.name}`, user);
      const members = await this.getGameRoomMemberList(
        `game:ready#${socket.nsp.name}`,
      );
      newNamespace.emit(Event.READY, members);
    }
  }

  @SubscribeMessage(Event.UNREADY)
  async handleUnready(
    @MessageBody() data: { user: UserProfile; gameNumber: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = JSON.stringify(data.user);
    const newNamespace = socket.nsp;
    const isReady = await this.redis.sismember(
      `game:ready#${socket.nsp.name}`,
      user,
    );
    if (isReady) {
      await this.redis.srem(`game:ready#${socket.nsp.name}`, user);
      const members = await this.getGameRoomMemberList(
        `game:ready#${socket.nsp.name}`,
      );
      newNamespace.emit(Event.READY, members);
    }
  }
  @SubscribeMessage(Event.START)
  async handleStart(
    @MessageBody() data: { user: UserProfile; gameNumber: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const newNamespace = socket.nsp;
    const leader: UserProfileInGame = JSON.parse(
      await this.redis.lindex(`${GamePrefix.gameMembers}${data.gameNumber}`, 0),
    );
    if (data.user.id === leader.userId) {
      const readyCount = await this.redis.scard(
        `game:ready#${socket.nsp.name}`,
      );
      const memberCount = await this.redis.llen(
        `${GamePrefix.gameMembers}${data.gameNumber}`,
      );
      if (memberCount === readyCount + 1) {
        newNamespace.emit(Event.START, {
          start: true,
          gameNumber: data.gameNumber,
        });
      } else {
        newNamespace.emit(Event.START, {
          start: false,
          gameNumber: data.gameNumber,
        });
      }
    } else {
      newNamespace.emit(Event.START, {
        start: false,
        gameNumber: data.gameNumber,
      });
    }
  }

  @SubscribeMessage(Event.MESSAGE)
  async handleMessage(
    @MessageBody() data: { message: object },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.nsp.emit(Event.MESSAGE, data.message);
  }

  @SubscribeMessage(Event.SERVER_MESSAGE)
  async handleServerMessage(
    @MessageBody() data: { message: object },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.nsp.emit(Event.SERVER_MESSAGE, data.message);
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`socket connected ${socket.nsp.name} ${socket.id}`);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`socket disconnected: ${socket.id}`);
    const members = await this.getGameRoomMemberList(
      `game:ready#${socket.nsp.name}`,
    );
    socket.nsp.emit(Event.LEAVE, members);
  }

  afterInit(server: any) {
    this.logger.log('after init');
  }

  async getGameRoomMemberList(key: string): Promise<UserProfile[]> {
    return (await this.redis.smembers(key)).map((member) => JSON.parse(member));
  }
}
