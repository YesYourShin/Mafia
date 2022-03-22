import { Inject, Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
  BaseWsExceptionFilter,
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
import { IncomingMessage } from 'http';
import { Server, Socket } from 'socket.io';
import { GamePrefix } from 'src/modules/game-room/constants';
import { UserProfileInGame } from 'src/modules/game-room/dto';
import { REDIS_GAME } from 'src/modules/redis';
import { UserProfile } from 'src/modules/user/dto';
import { RoomLimitationGuard } from '../guards/room-limitation.guard';
import { WsAuthenticatedGuard } from '../guards/ws.authenticated.guard';
import { Event } from './constants';
import { GameRoomEventService } from './game-room-event.service';

export interface socketWithUser extends IncomingMessage {
  user: UserProfile;
}

@WebSocketGateway({
  transports: ['websocket'],
  cors: { origin: '*', credentials: true },
  namespace: '/game',
})
export class GameRoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @InjectRedis(REDIS_GAME) private readonly redis: Redis,
    private readonly gameRoomEventService: GameRoomEventService,
  ) {}
  @WebSocketServer() public server: Server;

  @UseFilters(new BaseWsExceptionFilter())
  @UseGuards(WsAuthenticatedGuard, RoomLimitationGuard)
  @SubscribeMessage(Event.JOIN)
  async handleJoin(
    @MessageBody() data: { gameRoomNumber: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const { user } = socket.request as socketWithUser;
    const newNamespace = socket.nsp;
    const gameRoomNumber = +newNamespace.name.split('-')[1];
    await this.gameRoomEventService.join(
      gameRoomNumber,
      UserProfileInGame.profile(user.profile),
    );
    socket.join(`${newNamespace.name}-${data.gameRoomNumber}`);
    const members = await this.gameRoomEventService.findMembers(gameRoomNumber);
    newNamespace.emit(Event.ONLINELIST, members);
  }
  @SubscribeMessage(Event.READY)
  async handleReady(
    @MessageBody() data: { user: UserProfile; gameRoomNumber: number },
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
    @MessageBody() data: { user: UserProfile; gameRoomNumber: number },
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
    @MessageBody() data: { user: UserProfile; gameRoomNumber: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const newNamespace = socket.nsp;
    const leader: UserProfileInGame = JSON.parse(
      await this.redis.lindex(
        `${GamePrefix.gameRoomMembers}${data.gameRoomNumber}`,
        0,
      ),
    );
    if (data.user.id === leader.userId) {
      const readyCount = await this.redis.scard(
        `game:ready#${socket.nsp.name}`,
      );
      const memberCount = await this.redis.llen(
        `${GamePrefix.gameRoomMembers}${data.gameRoomNumber}`,
      );
      if (memberCount === readyCount + 1) {
        newNamespace.emit(Event.START, {
          start: true,
          gameRoomNumber: data.gameRoomNumber,
        });
      } else {
        newNamespace.emit(Event.START, {
          start: false,
          gameRoomNumber: data.gameRoomNumber,
        });
      }
    } else {
      newNamespace.emit(Event.START, {
        start: false,
        gameRoomNumber: data.gameRoomNumber,
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

  async handleConnection(@ConnectedSocket() socket: Socket) {}

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { user } = socket.request as socketWithUser;
    const newNamespace = socket.nsp;
    const gameRoomNumber = +newNamespace.name.split('-')[1];
    console.log('rooms', socket.rooms);
    for (const room of socket.rooms) console.log('room', room);
    await this.gameRoomEventService.leave(
      7,
      UserProfileInGame.profile(user.profile),
    );

    const members = await this.gameRoomEventService.findMembers(gameRoomNumber);
    newNamespace.emit(Event.ONLINELIST, members);
  }

  afterInit(server: any) {}

  async getGameRoomMemberList(key: string): Promise<UserProfile[]> {
    return (await this.redis.smembers(key)).map((member) => JSON.parse(member));
  }
}
