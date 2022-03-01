import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: /\/game-.+/ })
export class GameMessageGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(@Inject(Logger) private readonly logger: Logger) {}
  //나중에 DI 주입해서 활용할 프로퍼티
  @WebSocketServer() public server: Server;
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  afterInit(server: any) {
    this.logger.log('after init');
  }

  //연결 됐을때
  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('connected', socket.nsp.name);
    // namespace 존재하지 않다면 생성
    socket.emit('hello', socket.nsp.name);
  }

  //연결 끊었을 때
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('handle disconnect');
    const newNamespace = socket.nsp;
    // 레디스에서 namespace안에 있는 socket 삭제
    newNamespace.emit(
      'onlineList',
      '현재 지금 레디스 안에 소켓 네임스페이스 객체',
    );
  }
}
