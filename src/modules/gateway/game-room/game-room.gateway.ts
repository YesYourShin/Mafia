import { Inject, Logger, UseGuards } from '@nestjs/common';
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
})
export class GameRoomGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Logger) private readonly logger: Logger,
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

      this.server
        .to(`${newNamespace.name}-${gameRoomNumber}`)
        .emit(GameRoomEvent.ONLINELIST, members);
    } catch (error) {
      console.error(error);
    }
  }
  @SubscribeMessage(GameRoomEvent.READY)
  async handleReady(
    @MessageBody() data: { gameRoomNumber: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { user } = socket.request;
    const newNamespace = socket.nsp;
  }

  @SubscribeMessage(GameRoomEvent.UNREADY)
  async handleUnready(
    @MessageBody() data: { user: UserProfile; gameRoomNumber: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const user = JSON.stringify(data.user);
    const newNamespace = socket.nsp;
  }

  @SubscribeMessage(GameRoomEvent.START)
  async handleStart(
    @MessageBody() data: { user: UserProfile; gameRoomNumber: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const newNamespace = socket.nsp;
    // const leader: Member = JSON.parse(
    //   await this.redis.lindex(
    //     `${GameRoomPrefix.gameRoomMembers}${data.gameRoomNumber}`,
    //     0,
    //   ),
    // );
    // if (data.user.id === leader.userId) {
    //   const readyCount = await this.redis.scard(
    //     `game:ready#${socket.nsp.name}`,
    //   );
    //   const memberCount = await this.redis.llen(
    //     `${GameRoomPrefix.gameRoomMembers}${data.gameRoomNumber}`,
    //   );
    //   if (memberCount === readyCount + 1) {
    //     newNamespace.emit(GameRoomEvent.START, {
    //       start: true,
    //       gameRoomNumber: data.gameRoomNumber,
    //     });
    //   } else {
    //     newNamespace.emit(GameRoomEvent.START, {
    //       start: false,
    //       gameRoomNumber: data.gameRoomNumber,
    //     });
    //   }
    // } else {
    //   newNamespace.emit(GameRoomEvent.START, {
    //     start: false,
    //     gameRoomNumber: data.gameRoomNumber,
    //   });
    // }
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

    await this.gameRoomEventService.leave(gameRoomNumber, user.id);

    const members =
      await this.gameRoomEventService.findAllMemberByGameRoomNumber(
        gameRoomNumber,
      );
    newNamespace
      .to(`${newNamespace.name}-${gameRoomNumber}`)
      .emit(GameRoomEvent.ONLINELIST, members);
  }

  afterInit(server: any) {}
}
