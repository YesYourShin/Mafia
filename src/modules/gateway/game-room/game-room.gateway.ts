import { forwardRef, Inject, Logger, UseGuards } from '@nestjs/common';
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
import { Server, Socket } from 'socket.io';
import { Member } from 'src/modules/game-room/dto';
import { UserProfile } from 'src/modules/user/dto';
import { RedisIoAdapter } from 'src/shared/adapter/RedisIoAdapter';
import { RoomLimitationGuard } from '../guards/room-limitation.guard';
import { WsAuthenticatedGuard } from '../guards/ws.authenticated.guard';
import { GameRoomEvent } from './constants';
import { AuthenticatedSocket } from './constants/authenticated-socket';
import { GameRoomEventService } from './game-room-event.service';

@UseGuards(WsAuthenticatedGuard)
@WebSocketGateway({
  transports: ['websocket'],
  cors: { origin: '*', credentials: true },
  namespace: '/room',
  adapter: RedisIoAdapter,
})
export class GameRoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Logger) private readonly logger = new Logger('GameRoomGateway'),
    @Inject(forwardRef(() => GameRoomEventService))
    private readonly gameRoomEventService: GameRoomEventService,
  ) {}
  @WebSocketServer() public server: Server;

  @UseGuards(RoomLimitationGuard)
  @SubscribeMessage(GameRoomEvent.JOIN)
  async handleJoin(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { user } = socket.request;
    const newNamespace = socket.nsp;
    const { roomId } = data;
    socket.data.roomId = roomId;

    try {
      await socket.join(`${newNamespace.name}-${roomId}`);

      const members = await this.gameRoomEventService.join(
        roomId,
        new Member(user.profile),
      );
      const readyMember = await this.gameRoomEventService.getGameReadyMember(
        roomId,
      );

      for (const member of members) {
        member.ready = false;
        for (const memberId of readyMember) {
          if (member.userId === memberId) {
            member.ready = true;
          }
        }
      }

      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameRoomEvent.ONLINELIST, members);
    } catch (error) {
      console.error(error);
    }
  }
  @SubscribeMessage(GameRoomEvent.READY)
  async handleReady(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    await this.gameRoomEventService.gameReady(roomId, user.id);

    this.server
      .to(`${newNamespace.name}-${roomId}`)
      .emit(GameRoomEvent.READY, user.id);
  }

  @SubscribeMessage(GameRoomEvent.UNREADY)
  async handleUnready(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    await this.gameRoomEventService.gameUnReady(roomId, user.id);

    this.server
      .to(`${newNamespace.name}-${roomId}`)
      .emit(GameRoomEvent.READY, user.id);
  }

  @SubscribeMessage(GameRoomEvent.START)
  async handleStart(
    @MessageBody() data: { user: UserProfile; roomId: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    const members = await this.gameRoomEventService.findMembersByRoomId(roomId);

    const ready = await this.gameRoomEventService.getGameReadyMember(roomId);
  }

  @SubscribeMessage(GameRoomEvent.MESSAGE)
  async handleMessage(
    @MessageBody() data: { message: object },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    socket.nsp.emit(GameRoomEvent.MESSAGE, data.message);
  }

  @SubscribeMessage(GameRoomEvent.SERVER_MESSAGE)
  async handleServerMessage(
    @MessageBody() data: { message: object },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    socket.nsp.emit(GameRoomEvent.SERVER_MESSAGE, data.message);
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {}

  async handleDisconnect(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    console.log('roomId', roomId);

    try {
      await this.gameRoomEventService.leave(roomId, user.id);
    } catch (error) {
      this.logger.error(error);
    }

    const members = await this.gameRoomEventService.findMembersByRoomId(roomId);
    const readyMember = await this.gameRoomEventService.getGameReadyMember(
      roomId,
    );

    for (const member of members) {
      for (const memberId of readyMember) {
        member.ready = member.userId === memberId;
      }
    }
    newNamespace
      .to(`${newNamespace.name}-${roomId}`)
      .emit(GameRoomEvent.ONLINELIST, members);
  }

  afterInit(server: any) {}
}
