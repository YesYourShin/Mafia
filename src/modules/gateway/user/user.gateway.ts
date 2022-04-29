import { Inject, Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../game-room/constants/authenticated-socket';
import { WsAuthenticatedGuard } from '../guards/ws.authenticated.guard';
import { UserEventService } from './user-event.service';

@UseGuards(WsAuthenticatedGuard)
@WebSocketGateway({
  transports: ['websocket'],
  cors: { origin: '*', credentials: true },
  namespace: '/user',
})
export class UserGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Logger) private readonly logger = new Logger('UserGateway'),
    private readonly userEventService: UserEventService,
  ) {}
  @WebSocketServer() public server: Server;

  async handleConnection(socket: AuthenticatedSocket) {
    const newNamespace = socket.nsp;
    const { user } = socket.request;
    try {
      await socket.join(`${newNamespace.name}-${user.id}`);
      await this.userEventService.setOnline(user.id);
    } catch (error) {
      this.logger.error('handle connection error in user gateway', error);
    }
  }

  async handleDisconnect(socket: AuthenticatedSocket) {
    const newNamespace = socket.nsp;
    const { user } = socket.request;

    try {
      await this.userEventService.setOffline(user.id);
    } catch (error) {
      this.logger.error('handle disconnect error in user gateway', error);
    }
  }
  afterInit(server: any) {}
}
