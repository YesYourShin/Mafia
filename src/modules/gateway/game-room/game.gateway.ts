import { ForbiddenException, Inject, Logger, UseGuards } from '@nestjs/common';
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
import { AuthenticatedSocket } from './constants/authenticated-socket';
import { WsAuthenticatedGuard } from '../guards/ws.authenticated.guard';
import { GamePlayerGuard } from '../guards/game-player.guard';
import { GameEvent } from './constants';
import { Game } from '../../../entities/game.entity';
import dayjs from 'dayjs';

@UseGuards(WsAuthenticatedGuard)
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
  // 마피아는 인원수에 따라 변경 6부터 1명 , 나미저 2명

  typesOfJobs = ['CITIZEN', 'MAFIA', 'DOCTOR', 'POLICE']; // 직업

  // 서버에서 시간을 돌려야 하는 것도 있다. - 서버에서 시간을 돌린다.
  // @SubscribeMessage('counter')
  // counter(){
  //   // 브로드 캐스트
  //   this.server.emit();
  // }

  // 가드를 통해서 플레이어인지 확인
  @UseGuards(GamePlayerGuard)
  @SubscribeMessage('game:join')
  async handleGameJoin(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { roomId: number },
  ) {
    const { user } = socket.request;
    const newNamespace = socket.nsp;
    const { roomId } = data;
    socket.data['roomId'] = roomId;

    this.logger.log(roomId);

    try {
      await socket.join(`${newNamespace.name}-${roomId}`);
      this.server.in(socket.id).emit('gamejoin', user);
    } catch (error) {
      this.logger.error('socket join event error', error);
    }
  }

  @SubscribeMessage(GameEvent.Timer)
  async handleTimer(socket: AuthenticatedSocket) {
    const roomId = socket.data.roomId;
    const newNamespace = socket.nsp;

    let counter = 60;
    const StartTimer = setInterval(function () {
      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.Timer, { counter: counter });
      counter--;
      if (counter === 0) {
        this.server
          .to(`${newNamespace.name}-${roomId}`)
          .emit(GameEvent.Timer, { counter: counter });
        clearInterval(StartTimer);
      }
    }, 1000);
  }

  @SubscribeMessage(GameEvent.Day)
  async HandleDay(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { day: boolean },
  ) {
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    // default - 밤 - false
    if (data.day === false) {
      const thisDay = !data.day;
      this.server
        .in(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.Day, { day: thisDay });
    }
  }
  @SubscribeMessage(GameEvent.Start)
  async handleStart(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    const gamePlayers = await this.gameEventService.findPlayers(roomId);
    if (gamePlayers.length < 6)
      //  throw new ForbiddenException()
      throw new ForbiddenException('인원이 부족합니다.');

    // 비동기 신호
    setTimeout(() => {
      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.Start, gamePlayers);
    }, 5000);
  }

  // 직업 배분
  @SubscribeMessage(GameEvent.Job)
  async handleGrantJob(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    const gamePlayers = await this.gameEventService.findPlayers(roomId);

    this.logger.log(gamePlayers);

    const mafia = 1;
    const doctor = 1;
    const police = 1;

    const cr = this.gamePlayerNum - (mafia + doctor + police);
    // 마피아, 의사,경찰, 시민
    const jobData = [cr, mafia, doctor, police];
    this.logger.log(`grantjob ` + jobData);
    let roomJob = []; //해당 방의 직업
    const roomC = [];

    this.logger.log(
      ` 현재 room : ${this.roomName} 인원수 ${this.gamePlayerNum}`,
    );

    // 자신의 직업만 보내줘야 함. 해당 소켓에다가
    if (roomC.length === 0) {
      // 직업 분배 + 셔플
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
        roomC.push(data);
      }
    }

    this.logger.log(this.roomClient);
    this.logger.log(roomC);
    this.roomClient = roomC;

    const returndata = {
      room: this.roomName,
      jobs: this.roomClient,
    };

    // 직업 배분 셔플 결과
    this.logger.log('returndata');
    this.logger.log(returndata);

    this.server.to(this.roomName).emit('grantJob', returndata);
  }

  // 하나하나 받은 투표 결과들을 배열로 추가하기
  vote = [];
  //배열의 합..

  @SubscribeMessage('vote')
  handleVote(
    @MessageBody() payload: { voteNum: number },
    @ConnectedSocket() socket: Socket,
  ) {
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
  }

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

    //roomClient - 숫자, user, 직업.

    if (this.vote.length === this.gamePlayerNum) {
      this.vote.forEach((element) => {
        redisVote[element] = (redisVote[element] || 0) + 1;
      });

      const voteUser = [];

      Object.keys(redisVote).forEach((value) => {
        this.logger.log(value);
        const data = {
          num: value,
          user: this.roomClient[+value - 1].user,
          voteSum: redisVote[value],
        };

        voteUser.push(data);
      });

      redisVote = voteUser.sort(function (a, b) {
        return b.vote - a.vote;
      });

      this.logger.log(redisVote);

      this.server.to(this.roomName).emit('finishVote', {
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

      this.server.to(this.roomName).emit('startPunishmentVote', {
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
    this.server.to(this.roomName).emit('death', this.roomClient);
  }

  @SubscribeMessage('dayNight')
  async handleDayNight(
    @MessageBody() data: { dayNight: string },
    @ConnectedSocket() socket: Socket,
  ) {
    // 살아있는 마피아 수,

    const numberOfMafias = this.roomClient.filter(
      (item) => item.job === this.typesOfJobs[1] && item.die === false,
    ).length;

    const numberOfCitizen = this.roomClient.filter(
      (item) => item.job !== this.typesOfJobs[1] && item.die === false,
    ).length;

    this.logger.log(`살아있는 마피아 수: ${numberOfMafias}`);
    // 마피아 수가 0일 시
    if (!numberOfMafias)
      this.server.to(socket.id).emit('dayNight', '마피아 패');
    // 밤일 경우, 마피아 수가 시민수와 같을 시
    if (numberOfMafias === numberOfCitizen && data.dayNight === 'night')
      this.server.to(socket.id).emit('dayNight', '마피아 승');
  }

  // 능력사용 부분
  // 경찰 능력
  @SubscribeMessage('usePolice')
  handleUsePolice(
    @MessageBody() payload: { num: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const clientJob = this.gameEventService.usePoliceState(
      payload.num,
      this.roomClient,
      socket.id,
    );

    if (!clientJob) this.logger.log(`현재 user가 경찰이 아닙니다.`);
    else this.server.to(socket.id).emit('usePolice', clientJob);
  }

  @SubscribeMessage('myFaceLandmarks')
  handleLandmarks(@MessageBody() data: { landmarks: string; id: string }) {
    if (!data.landmarks) {
      this.server.emit('othersFaceLandmarks', {
        landmarks: null,
        id: data.id,
      });
    } else {
      this.server.emit('othersFaceLandmarks', {
        landmarks: data.landmarks,
        id: data.id,
      });
    }
  }

  // 마피아 능력

  // // 능력 사용 결과
  // @SubscribeMessage('useState')
  // handleUseState(
  //   @MessageBody()
  //   data: {
  //     user: string;
  //     job: string;
  //     useNum: number;
  //   },
  // ) {
  //   this.logger.log(`능력사용`);
  //   const grantJob = ['CITIZEN', 'MAFIA', 'DOCTOR', 'POLICE']; // 직업

  //   if (data.job !== grantJob[0] && ) {
  //     const a = {
  //       user: data.user,
  //       job: data.job,
  //       useNum: data.useNum,
  //     };
  //     this.userState.push(a);
  //     limit -= 1;
  //   }
  // }

  // -----------------------
  // 1. 하나의 on을 받고 그 안에서  낮, 밤상태를 구분해서 게임 처리?
  // 1. 낮이 시작할 때, 밤이 시작할 때 마다 on으로 를 따로 따로 처리..

  // socket이 연결됐을 때
  async handleConnection(@ConnectedSocket() socket: AuthenticatedSocket) {
    // 생성될 때 소켓 인스턴스의 namespace,  id
    this.logger.log(
      `socket connected ${socket.nsp.name} ${socket.id} ${socket.data.roomId}`,
    );
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
