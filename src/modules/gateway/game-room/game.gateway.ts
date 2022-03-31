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
import { Server, Socket } from 'socket.io';

// @UseGuards(WsAuthenticatedGuard) - 현재 소켓에 가드 설정
// @Injectable()
// export class WsAuthenticatedGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const client = context.switchToWs().getClient(); //클라이언트
//     const request = client.request; //클라이언트 요청
//     const can = request.isAuthenticated(); //클라이언트
//     if (!can) {
//       throw new WsException('유효하지 않은 사용자');
//     }
//     return can;
//   }
// }
@WebSocketGateway({
  // path: '/socket.io' <- defaut path,
  transports: ['websocket'],
  cors: { origin: '*', credentials: true },
  namespace: '/game',
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(@Inject(Logger) private readonly logger: Logger) {}
  @WebSocketServer() public server: Server;

  roomName = 'room1'; //방 이름.
  private roomJob = []; //해당 방의 직업
  private roomClient = []; // room인원
  private gamePlayerNum = 0;

  // 시작 신호 보내기
  @SubscribeMessage('gameMessage')
  async gamestart(
    @MessageBody() data: number,
    @ConnectedSocket() socket: Socket,
  ) {
    if (this.gamePlayerNum > 5) {
      setTimeout(() => {
        this.server
          .to(this.roomName)
          .emit('gameMessage', { status: 'ok', time: `${data}` });
        this.logger.log(`socketid: ${socket.id} , 발생 `);
      }, 1000 * data);
    }
  }

  // 임의로 만든 것
  // 방 join
  @SubscribeMessage('gamejoin')
  async handleGamejoin(@ConnectedSocket() socket: Socket) {
    socket.join(this.roomName);

    socket.rooms.forEach((room) => {
      if (room == this.roomName) {
        this.logger.log(`user: ${socket.id},  들어 있는 방 room : ${room}`);
      }
    });

    // respone값
    const data = {
      roomNum: this.roomName,
      join: 'ok',
      user: `${socket.id}`,
    };

    this.server.in(this.roomName).emit('gamejoin', data);
  }

  // 직업 배분
  @SubscribeMessage('grantJob')
  async handleGrantJob() {
    // 해당 room에 소켓 정보들
    const gamePlayers = await this.server.in(this.roomName).allSockets();
    //해당 room에 인원 수
    this.gamePlayerNum = gamePlayers.size;
    // room의 정해진 직업을 주면 대입
    const mafia = 1;
    const doctor = 1;
    const police = 1;
    const cr: number = this.gamePlayerNum - (mafia + doctor + police);
    // 마피아, 의사,경찰, 시민
    const jobData = [cr, mafia, doctor, police];
    const grantJob = ['CITIZEN', 'MAFIA', 'DOCTOR', 'POLICE']; // 직업

    this.logger.log(
      ` 현재 room : ${this.roomName} 인원수 ${this.gamePlayerNum}`,
    );

    if (this.gamePlayerNum < 6) {
      this.server
        .to(this.roomName)
        .emit(
          'grantJob',
          `인원이 부족합니다. 현재 인원은 ${this.gamePlayerNum}명`,
        );
    } else if (this.gamePlayerNum > 10) {
      this.server
        .to(this.roomName)
        .emit(
          'grantJob',
          `최대 인원입니다. 현재 인원은 ${this.gamePlayerNum}명`,
        );
    } else {
      for (let item = 0; item < this.gamePlayerNum; item++) {
        const ran = Math.floor(Math.random() * grantJob.length); //직업
        // const ran = Math.floor(Math.random() * 2); //직업
        const jobCountData = this.roomJob.filter(
          (item) => item === grantJob[ran],
        ).length; //현재 같은 직업 수

        if (jobCountData < jobData[ran]) {
          this.logger.log(
            ` 1: 현재 부여된 직업의 수: ${jobCountData}, 현재 걸린 직업: ${grantJob[ran]}`,
          );
          this.roomJob.push(grantJob[ran]);
          const data = {
            num: item + 1,
            user: Array.from(gamePlayers)[item],
            job: this.roomJob[item],
          };
          this.roomClient.push(data);
        } else {
          this.logger.log(
            ` 3: 현재 부여된 직업의 수: ${jobCountData}, 현재 걸린 직업: ${grantJob[ran]}`,
          );
          item--;
        }
      }

      const data = {
        room: this.roomName,
        jobs: this.roomClient,
      };

      this.logger.log(data);

      this.server.to(this.roomName).emit('grantJob', data);
    }
  }

  @SubscribeMessage('finishVote')
  async handleFinishVote(@MessageBody() voteNum: number) {}

  // socket이 연결됐을 때
  async handleConnection(@ConnectedSocket() socket: Socket) {
    // 생성될 때 소켓 인스턴스의 namespace,  id
    this.logger.log(`socket connected ${socket.nsp.name} ${socket.id}`);
    this.handleGamejoin(socket);
  }
  // socket이 연결 끊겼을 때
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`socket disconnected: ${socket.id}`);
  }

  afterInit(server: any) {
    this.logger.log('after init');
  }
}
