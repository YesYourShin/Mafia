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
import { UserProfile } from '../../user/dto/user-profile.dto';
import { GameRoomEventService } from './game-room-event.service';

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
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly gameRoomEventService: GameRoomEventService,
  ) {}
  @WebSocketServer() public server: Server;

  roomName = 'room1'; //방 이름.
  roomClient = []; // room인원
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
  async handleGrantJob(
    @MessageBody() data: { user: UserProfile; gameRoomNumber: number },
  ) {
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
    let roomJob = []; //해당 방의 직업

    this.logger.log(
      ` 현재 room : ${this.roomName} 인원수 ${this.gamePlayerNum}`,
    );

    if (this.roomClient.length === 0) {
      for (let item = 0; item < this.gamePlayerNum; item++) {
        const ran = Math.floor(Math.random() * grantJob.length); //직업
        const jobCountData = roomJob.filter(
          (item) => item === grantJob[ran],
        ).length; //현재 같은 직업 수

        if (jobCountData > jobData[ran] - 1) {
          item--;
        }
        roomJob.push(grantJob[ran]);
      }

      // 수만큼 직업 배분
      this.logger.log(roomJob);
      // 직업 셔플
      const a = roomJob;
      const strikeOut = [];
      while (a.length) {
        const lastidx = a.length - 1;
        const roll = Math.floor(Math.random() * a.length);
        const temp = a[lastidx];
        a[lastidx] = a[roll];
        a[roll] = temp;
        strikeOut.push(a.pop());
      }

      roomJob = strikeOut;

      // 셔플
      this.logger.log(roomJob);

      for (let i = 0; i < this.gamePlayerNum; i++) {
        const data = {
          num: i + 1,
          user: Array.from(gamePlayers)[i],
          job: roomJob[i],
        };
        this.roomClient.push(data);
      }
    }

    const returndata = {
      room: this.roomName,
      jobs: this.roomClient,
    };

    // 직업 배분 셔플 결과
    this.logger.log(returndata);

    this.server.to(this.roomName).emit('grantJob', returndata);
  }

  // @SubscribeMessage('Shuffle')
  // Shuffle(data: any[]) {
  //   // 피셔 에이츠 셔플

  //   return strikeOut;
  // }

  // 하나하나 받은 투표 결과들을 배열로 추가하기
  vote = [];
  //배열의 합..
  redisVote = [];

  // 투표 합.
  @SubscribeMessage('finishVote')
  async handleFinishVote(
    @MessageBody() voteNum: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const gamePlayers = await this.server.in(this.roomName).allSockets();
    this.gamePlayerNum = gamePlayers.size;
    this.vote.push(voteNum);
    this.logger.log(
      `socket : ${socket.id}, 투표 번호: ${voteNum}, voteleng : ${this.vote.length}, gameplayer: ${gamePlayers} `,
    );
    if (this.vote.length === this.gamePlayerNum) {
      this.logger.log(
        ` vote : ${this.vote.length}, gameplayer: ${this.gamePlayerNum}`,
      );
      this.vote.forEach((element) => {
        this.logger.log(` ele ${element}`);
        this.redisVote[element - 1] = element;
      });

      this.logger.log(`투표 합 시작`);

      this.server.to(this.roomName).emit('finishVote', {
        voteResult: this.redisVote,
      });
    }
  }

  @SubscribeMessage('dayNight')
  async handleDayNight(@MessageBody() data: string) {
    this.logger.log(` ${data}`);
  }

  // -----------------------
  // 1. 하나의 on을 받고 그 안에서  낮, 밤상태를 구분해서 게임 처리?
  // 1. 낮이 시작할 때, 밤이 시작할 때 마다 on으로 를 따로 따로 처리..

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
