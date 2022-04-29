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
import { Index } from 'typeorm';
import { check } from 'prettier';

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

  // 마피아는 인원수에 따라 변경 6부터 1명 , 나미저 2명

  // typesOfJobs = ['CITIZEN', 'MAFIA', 'DOCTOR', 'POLICE']; // 직업

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

    this.logger.log(`gameRoom ${roomId}`);

    try {
      await socket.join(`${newNamespace.name}-${roomId}`);
      this.server.in(socket.id).emit('gamejoin', user);
    } catch (error) {
      this.logger.error('socket join event error', error);
    }
  }

  @SubscribeMessage(GameEvent.Timer)
  async handleTimer(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    const now = dayjs();

    //시작 신호
    const startTime = now.format();
    this.logger.log(`start: ${startTime}`);

    //만료 신호
    const endTime = now.add(1, 'm').format();
    this.logger.log(`end: ${endTime}`);
    try {
      this.server
        .in(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.Timer, { start: startTime, end: endTime });
    } catch (error) {
      this.logger.error('event error', error);
    }
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
    const { user } = socket.request;
    const newNamespace = socket.nsp;

    const gamePlayers = await this.gameEventService.findPlayers(roomId);
    // if (gamePlayers.length < 6)
    //   //  throw new ForbiddenException()
    //   throw new ForbiddenException('인원이 부족합니다.');

    let count;
    //count
    for(const player of gamePlayers){
        if(player.id === user.id) {count = await this.gameEventService.setPlayerNum(roomId)}
      }

    if(gamePlayers.length === count){
      this.gameEventService.delPlayerNum(roomId);
    // 비동기 신호
    setTimeout(() => { 
      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.Start, gamePlayers);
    }, 1000);
    }

  }

  // 직업배분

  // 각자의 직업만 제공
  @SubscribeMessage(GameEvent.Job)
  async handleGrantJob(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request; 
    const { roomId } = socket.data;

    // 현재 방의 인원
    let gamePlayers = await this.gameEventService.findPlayers(roomId);
    let Num = gamePlayers.length;


    const mafia = 1;
    const doctor = 1;
    const police = 1;
    const cr = Num - (mafia + doctor + police);
    const jobData = [cr, mafia, doctor, police];

    let count;
    for(const player of gamePlayers){
      if(player.id === user.id) {
        count = await this.gameEventService.setPlayerNum(roomId);
        break;
      }
    }

    // 첫번째 소켓일 때, 직업 설정
    if(count === 1){
      await this.gameEventService.setPlayerJobs(roomId, jobData, Num);
    }
    
    // 특정 플레이어의 순서 === jobs[순서]
    const checkJob = await this.gameEventService.getPlayerJobs(roomId);

    this.logger.log(`socket:id ${socket.id}`);
    this.logger.log('변경전', gamePlayers);

    for(let i = 0; i< Num; i++){
      if(gamePlayers[i].id === user.profile.id){
        gamePlayers[i].job = checkJob[i].job;
        this.logger.log(gamePlayers[i].job);
        this.logger.log(checkJob[i].job);
        break;
      }
    }
    this.logger.log('변경 후', gamePlayers);
    // for(let i = 0; i< Num; i++){
    //   if(gamePlayers[i].id === user.profile.id){
    //     gamePlayers[i].job = checkJob.jobs[i];
    //   }
    // }

    // for(let playerJob in gamePlayers){
    //   gamePlayers[playerJob].job = checkJob[playerJob].job
    // }

    this.server.in(socket.id).emit(GameEvent.Job, gamePlayers);
  }

  // 하나하나 받은 투표 결과들을 배열로 추가하기
  vote = [];
  //배열의 합..

  @SubscribeMessage('vote')
  handleVote(
    @MessageBody() data: { vote: number },
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {

    const { roomId } = socket.data;


    // // 1. 플레이어 숫자 내일 경우 값 추가. (플레이어는 손으로 선택해서 주지만 일단.. 테스트할 때 조심하기 위해서)
    // if (
    //   data.voteNum <= this.gamePlayerNum &&
    //   this.vote.length <= this.gamePlayerNum &&
    //   typeof payload.voteNum === 'number'
    // )
    //   this.vote.push(payload.voteNum); //undefined
    // this.logger.log(
    //   `플레이어 수 : ${this.gamePlayerNum}, user: ${socket.id}, 투표 번호: ${payload.voteNum}, 총 투표수 : ${this.vote.length}`,
    // );
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

  // @SubscribeMessage('dayNight')
  // async handleDayNight(
  //   @MessageBody() data: { dayNight: string },
  //   @ConnectedSocket() socket: Socket,
  // ) {
  //   // 살아있는 마피아 수,

  //   const numberOfMafias = this.roomClient.filter(
  //     (item) => item.job === this.typesOfJobs[1] && item.die === false,
  //   ).length;

  //   const numberOfCitizen = this.roomClient.filter(
  //     (item) => item.job !== this.typesOfJobs[1] && item.die === false,
  //   ).length;

  //   this.logger.log(`살아있는 마피아 수: ${numberOfMafias}`);
  //   // 마피아 수가 0일 시
  //   if (!numberOfMafias)
  //     this.server.to(socket.id).emit('dayNight', '마피아 패');
  //   // 밤일 경우, 마피아 수가 시민수와 같을 시
  //   if (numberOfMafias === numberOfCitizen && data.dayNight === 'night')
  //     this.server.to(socket.id).emit('dayNight', '마피아 승');
  // }

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