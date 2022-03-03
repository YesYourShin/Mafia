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
import { UserProfile } from 'src/modules/user/dto';

@WebSocketGateway({
  // path: '/socket.io' <- defaut path,
  transports: ['websocket'],
  cors: { origin: '*' },
  cookie: true,
  namespace: /\/game-.+/,
})
export class GameMessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @InjectRedis('game') private readonly redis: Redis,
  ) {}
  @WebSocketServer() public server: Server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
  @SubscribeMessage('join')
  async handleJoinGame(
    @MessageBody() data: { user: UserProfile; gameNumber: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const newNamespace = socket.nsp;
    await this.redis.sadd(`:${socket.nsp.name}`, JSON.stringify(data.user));
    newNamespace.emit(
      'onlineList',
      await this.redis.smembers(`:${socket.nsp.name}`),
    );
    this.logger.log(`join game ${data.gameNumber} - ${socket.id}`);
    socket.join(`${socket.nsp.name}-${data.gameNumber}`);
  }

  @SubscribeMessage('enter')
  async handleEnterLobby(@MessageBody() data: { user }) {}

  //연결 됐을때
  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log(`socket connected ${socket.nsp.name} ${socket.id}`);
    socket.emit('hello', socket.nsp.name);
  }

  //연결 끊었을 때
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`socket disconnected: ${socket.id}`);
    const newNamespace = socket.nsp;
    newNamespace.emit(
      'onlineList',
      '현재 지금 레디스 안에 소켓 네임스페이스 객체',
    );
  }

  afterInit(server: any) {
    this.logger.log('after init');
  }
}
