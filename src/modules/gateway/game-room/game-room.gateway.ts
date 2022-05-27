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
    socket.data['roomId'] = roomId;

    try {
      await socket.join(`${newNamespace.name}-${roomId}`);
      if (roomId === 0) {
        return;
      }

      const member = new Member(user.profile);
      const members = await this.gameRoomEventService.join(roomId, member);

      newNamespace
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameRoomEvent.JOIN, { member, members });
    } catch (error) {
      this.logger.error('socket join event error', error);
    }
  }
  @SubscribeMessage(GameRoomEvent.SPEAK)
  async handleSpeak(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: { userId: number; nickname: string; speaking: boolean },
  ) {
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    this.server
      .to(`${newNamespace.name}-${roomId}`)
      .emit(GameRoomEvent.SPEAK, data);
  }

  @SubscribeMessage(GameRoomEvent.READY)
  async handleReady(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    const members = await this.gameRoomEventService.setReady(roomId, user.id);

    this.server
      .to(`${newNamespace.name}-${roomId}`)
      .emit(GameRoomEvent.MEMBER_LIST, {
        members,
      });
  }

  @SubscribeMessage(GameRoomEvent.UNREADY)
  async handleUnready(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    const members = await this.gameRoomEventService.setReady(roomId, user.id);

    this.server
      .to(`${newNamespace.name}-${roomId}`)
      .emit(GameRoomEvent.MEMBER_LIST, {
        members,
      });
  }

  @SubscribeMessage(GameRoomEvent.START)
  async handleStart(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    try {
      await this.gameRoomEventService.startGame(roomId, user.id);
      await this.gameRoomEventService.setGame(roomId);

      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameRoomEvent.START, { roomId, start: true });
    } catch (error) {
      this.logger.error('start game error:', error);
    }
  }

  @SubscribeMessage(GameRoomEvent.MESSAGE)
  async handleMessage(
    @MessageBody() data: { message: string },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const { message } = data;

    const newNamespace = socket.nsp;

    try {
      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameRoomEvent.MESSAGE, {
          roomId,
          member: { id: user.id, name: user.profile.nickname },
          message,
        });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @SubscribeMessage(GameRoomEvent.LEAVE)
  async handleLeave(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;
    socket.data = null;

    const member = new Member(user.profile);

    try {
      await this.gameRoomEventService.leave(roomId, user.id);

      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameRoomEvent.LEAVE, { member });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {}

  async handleDisconnect(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    if (!roomId) {
      return;
    }

    socket.data = null;

    try {
      const members = await this.gameRoomEventService.leave(roomId, user.id);

      newNamespace
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameRoomEvent.MEMBER_LIST, { members });
    } catch (error) {
      this.logger.error(error);
    }
  }

  afterInit(server: any) {}
}
