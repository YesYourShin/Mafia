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
import { User } from '../../../entities/user.entity';

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

        if (jobCountData < jobData[ran]) {
          roomJob.push(grantJob[ran]);
        } else {
          item--;
        }
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

  // 죽은 사람
  dead = [];

  // 하나하나 받은 투표 결과들을 배열로 추가하기
  vote = [];
  //배열의 합..

  // 투표 합.
  @SubscribeMessage('finishVote')
  async handleFinishVote(
    @MessageBody() payload: { voteNum: number },
    @ConnectedSocket() socket: Socket,
  ) {
    if (this.roomClient.length === 0) this.logger.log(`직업 분배부터 부탁함.`);
    const gamePlayers = await this.server.in(this.roomName).allSockets();
    this.gamePlayerNum = gamePlayers.size;
    let redisVote = [];

    // 1. 플레이어 숫자 내일 경우 값 추가. (플레이어는 손으로 선택해서 주지만 일단.. 테스트할 때 조심하기 위해서)
    if (
      payload.voteNum <= this.gamePlayerNum &&
      this.vote.length <= this.gamePlayerNum &&
      typeof payload.voteNum === 'number'
    )
      this.vote.push(payload.voteNum); //undefined
    this.logger.log(
      `플레이어 수 : ${this.gamePlayerNum}, user: ${socket.id}, 투표 번호: ${payload.voteNum}, 총 투표수 : ${this.vote.length}`,
    );

    //roomClient - 숫자, user, 직업.

    if (this.vote.length === this.gamePlayerNum) {
      this.vote.forEach((element) => {
        redisVote[element] = (redisVote[element] || 0) + 1;
      });

      const aaaaaaaaa = [];
      this.logger.log(`플레이어 수 `);

      // -> redisVote - 투표 합. 여기서 객체랑 배열을 결합시켜야 함.

      Object.keys(redisVote).forEach((value) => {
        this.logger.log(value);
        const data = {
          num: value,
          user: this.roomClient[+value - 1].user,
          voteSum: redisVote[value],
        };

        aaaaaaaaa.push(data);
      });

      redisVote = aaaaaaaaa.sort(function (a, b) {
        return b.vote - a.vote;
      });

      this.logger.log(redisVote);

      this.server.to(this.roomName).emit('finishVote', {
        voteResult: redisVote,
      });
    }
  }

  punis = [];

  @SubscribeMessage('startPunishmentVote')
  handleStartPunishmentVote(
    @MessageBody() payload: { Punishment: boolean; user: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(` ${payload.Punishment}`);
    if (
      this.vote.length <= this.gamePlayerNum &&
      typeof payload.Punishment === 'boolean'
    )
      this.punis.push(payload.Punishment);
    if (this.punis.length === this.gamePlayerNum) {
      const punisAgreement = this.punis.filter((item) => item === true).length; //찬성 수

      this.logger.log(` 찬성 : ${punisAgreement}`);

      const punisOpposition = this.gamePlayerNum - punisAgreement;

      this.server.to(this.roomName).emit('startPunishmentVote', {
        voteResult: {
          user: payload.user,
          Agreement: punisAgreement,
          Opposition: punisOpposition,
        },
      });
    }
  }

  @SubscribeMessage('dayNight')
  async handleDayNight(@MessageBody() data: string) {
    this.logger.log(` ${data}`);
  }

  // 능력 사용 결과
  @SubscribeMessage('useStat')
  handleUseStat() {
    this.logger.log(`능력사용`);
  }

  // 죽은 사람 저장..?

  //

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
