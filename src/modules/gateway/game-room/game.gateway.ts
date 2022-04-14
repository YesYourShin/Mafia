import { Inject, Logger, LoggerService } from '@nestjs/common';
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
import { GameEventService } from './game-event.service';

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
    private readonly gameEventService: GameEventService,
  ) {}
  @WebSocketServer() public server: Server;

  roomName = 'room1'; //방 이름.
  roomClient = []; // room인원
  private gamePlayerNum = 0;
  private gamePlayers;

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
          .emit('gameMessage2', { status: 'ok', time: `${data}` });
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

    this.server.in(this.roomName).emit('gamejoin2', data);
  }

  // 직업 배분
  @SubscribeMessage('grantJob')
  async handleGrantJob(
    @MessageBody() data: { user: UserProfile; gameRoomNumber: number },
  ) {
    // 해당 room에 소켓 정보들
    this.gamePlayers = await this.server.in(this.roomName).allSockets();
    //해당 room에 인원 수
    this.gamePlayerNum = this.gamePlayers.size;
    // room의 정해진 직업을 주면 대입
    const mafia = 1;
    const doctor = 1;
    const police = 1;
    const cr: number = this.gamePlayerNum - (mafia + doctor + police);
    // 마피아, 의사,경찰, 시민
    const jobData = [cr, mafia, doctor, police];
    let roomJob = []; //해당 방의 직업

    this.logger.log(
      ` 현재 room : ${this.roomName} 인원수 ${this.gamePlayerNum}`,
    );

    if (this.roomClient.length === 0) {
      roomJob = this.gameEventService.GrantJob({
        playerNum: this.gamePlayerNum,
        jobData: jobData,
      });

      // roomJob = this.gameEventService.shuffle(roomJob);

      for (let i = 0; i < this.gamePlayerNum; i++) {
        const data = {
          num: i + 1,
          user: Array.from(this.gamePlayers)[i],
          job: roomJob[i],
          die: false,
        };
        this.roomClient.push(data);
      }
    }
    // const returndata = {
    //   room: this.roomName,
    //   jobs: this.roomClient,
    // };

    // 직업 배분 셔플 결과
    this.logger.log(this.roomClient);

    this.server.to(this.roomName).emit('grantJob2', this.roomClient);
  }

  // 하나하나 받은 투표 결과들을 배열로 추가하기
  vote = [];
  //배열의 합..

  // 투표 합.
  @SubscribeMessage('finishVote')
  async handleFinishVote(
    @MessageBody() payload: { voteNum: number },
    @ConnectedSocket() socket: Socket,
  ) {
    /* 낮일 시, 투표고 / 밤일 시, 능력사용?
      낮 - 한 유저 당 선택한 USER의 NUM

      밤 - 한 유저의 직업 + 선택한 USER의 NUM - 특수직업 만큼만.
     */
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

      this.server.to(this.roomName).emit('finishVote2', {
        voteResult: redisVote,
      });
    }
  }

  punis = [];

  // 찬반투표
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

      this.server.to(this.roomName).emit('startPunishmentVote2', {
        voteResult: {
          user: payload.user,
          Agreement: punisAgreement,
          Opposition: punisOpposition,
        },
      });
    }
  }

  // 사형.death
  @SubscribeMessage('death')
  async handleDeath(
    @MessageBody() payload: { agrement: boolean; user: string },
  ) {
    this.logger.log(` ${payload.agrement}`);
    if (payload.agrement === true) {
      this.roomClient.filter((client) => {
        if (client.user == payload.user) {
          client.dead = true;
        }
      });
    }
    this.server.to(this.roomName).emit('death2', this.roomClient);
  }

  @SubscribeMessage('dayNight')
  async handleDayNight(@MessageBody() data: string) {
    this.logger.log(` ${data}`);
  }

  userState = [];

  // // 능력 사용 결과
  @SubscribeMessage('useState')
  handleUseStat(
    @MessageBody() data: { user: string; job: string; useNum: number },
  ) {
    const a = 1;
    this.logger.log(`능력사용`);
    const grantJob = ['CITIZEN', 'MAFIA', 'DOCTOR', 'POLICE']; // 직업

    if (data.job != grantJob[0]) {
      const a = {
        user: data.user,
        job: data.job,
        useNum: data.useNum,
      };
      this.userState.push(a);
    }

    // 마피아 + 의사의 지목이 같은 사람일 경우 살아있음.
    // 아닐 경우 dead
    // 밤 - 한 유저의 직업 + 선택한 USER의 NUM - 특수직업 만큼만.
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
    socket.leave(this.roomName);
    this.logger.log(`socket disconnected: ${socket.id}`);
  }

  afterInit(server: any) {
    this.logger.log('after init');
  }
}
