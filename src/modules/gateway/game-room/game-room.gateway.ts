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
import passport from 'passport';
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
    @MessageBody() data: { gameRoomNumber: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { user } = socket.request;
    const newNamespace = socket.nsp;
    const { gameRoomNumber } = data;
    socket.data.gameRoomNumber = gameRoomNumber;

    try {
      await socket.join(`${newNamespace.name}-${gameRoomNumber}`);

      const members = await this.gameRoomEventService.joinGameRoom(
        gameRoomNumber,
        new Member(user.profile),
      );
      const readyMember = await this.gameRoomEventService.getGameReadyMember(
        gameRoomNumber,
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
        .to(`${newNamespace.name}-${gameRoomNumber}`)
        .emit(GameRoomEvent.ONLINELIST, members);
    } catch (error) {
      console.error(error);
    }
  }
  @SubscribeMessage(GameRoomEvent.READY)
  async handleReady(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { gameRoomNumber } = socket.data;
    const newNamespace = socket.nsp;

    await this.gameRoomEventService.gameReady(gameRoomNumber, user.id);

    this.server
      .to(`${newNamespace.name}-${gameRoomNumber}`)
      .emit(GameRoomEvent.READY, user.id);
  }

  @SubscribeMessage(GameRoomEvent.UNREADY)
  async handleUnready(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { gameRoomNumber } = socket.data;
    const newNamespace = socket.nsp;

    await this.gameRoomEventService.gameUnReady(gameRoomNumber, user.id);

    this.server
      .to(`${newNamespace.name}-${gameRoomNumber}`)
      .emit(GameRoomEvent.READY, user.id);
  }

  @SubscribeMessage(GameRoomEvent.START)
  async handleStart(
    @MessageBody() data: { user: UserProfile; gameRoomNumber: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { user } = socket.request;
    const { gameRoomNumber } = socket.data;
    const newNamespace = socket.nsp;

    const members =
      await this.gameRoomEventService.findAllMemberByGameRoomNumber(
        gameRoomNumber,
      );

    const ready = await this.gameRoomEventService.getGameReadyMember(
      gameRoomNumber,
    );
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
    const { gameRoomNumber } = socket.data;
    const newNamespace = socket.nsp;

    console.log('gameRoomNumber', gameRoomNumber);

    try {
      await this.gameRoomEventService.leave(gameRoomNumber, user.id);
    } catch (error) {
      this.logger.error(error);
    }

    const members =
      await this.gameRoomEventService.findAllMemberByGameRoomNumber(
        gameRoomNumber,
      );
    const readyMember = await this.gameRoomEventService.getGameReadyMember(
      gameRoomNumber,
    );

    for (const member of members) {
      for (const memberId of readyMember) {
        member.ready = member.userId === memberId;
      }
    }
    newNamespace
      .to(`${newNamespace.name}-${gameRoomNumber}`)
      .emit(GameRoomEvent.ONLINELIST, members);
  }

  afterInit(server: any) {}
}
