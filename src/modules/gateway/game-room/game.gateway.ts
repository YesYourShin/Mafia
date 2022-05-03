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
import { Server } from 'socket.io';
import { GameEventService } from './game-event.service';
import { AuthenticatedSocket } from './constants/authenticated-socket';
import { WsAuthenticatedGuard } from '../guards/ws.authenticated.guard';
import { GamePlayerGuard } from '../guards/game-player.guard';
import { GameEvent } from './constants';
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

    //능력 사용.

    // 승리조건
    const living = await this.gameEventService.livingHuman(roomId);
    const winner = this.gameEventService.winner(living.mafia, living.citizen);

      // ----------이벤트 추가 회의 한번..
      if(winner){
        this.server
        .in(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.Winner, {winner:winner});
      }

    // default - 밤 = false
      const thisDay = !data.day;
      this.server
        .in(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.Day, { day: thisDay });
  }

  //이겼을 시, 게임 정보 db에 저장하는 부분 로직도 짜야함.

  @SubscribeMessage(GameEvent.Start)
  async handleStart(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const newNamespace = socket.nsp;

    const Players = await this.gameEventService.findPlayers(roomId);
    // if (gamePlayers.length < 6)
    //   //  throw new ForbiddenException()
    //   throw new ForbiddenException('인원이 부족합니다.');

    let count;
    //count
    for (const player of Players) {
      if (player.id === user.id) {
        count = await this.gameEventService.setPlayerNum(roomId);
      }
    }

    this.logger.log(count);

    if (Players.length === count) {
      await this.gameEventService.delPlayerNum(roomId);
      // 비동기 신호
      setTimeout(() => {
        this.server
          .to(`${newNamespace.name}-${roomId}`)
          .emit(GameEvent.Start, Players);
      }, 1000);
    }
    const jobData = this.gameEventService.getJobData(Players.length);
    await this.gameEventService.setPlayerJobs(roomId, jobData, Players.length);
  }

  // 각자의 직업만 제공
  @SubscribeMessage(GameEvent.Job)
  async handleGrantJob(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;

    // 현재 방의 인원
    const Players = await this.gameEventService.findPlayers(roomId);

    // 특정 플레이어의 순서 === jobs[순서]
    const gamePlayer = await this.gameEventService.getPlayerJobs(roomId);

    for (let i = 0; i < Players.length; i++) {
      if (Players[i].id === user.profile.id) {
        Players[i].job = gamePlayer[i].job;
        break;
      }
    }

    this.logger.log(`socket.id: ${socket.id}`);
    this.server.in(socket.id).emit(GameEvent.Job, Players);
  }

  //투표
  @SubscribeMessage(GameEvent.Vote)
  async handleVote(
    @MessageBody() data: { vote: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { roomId } = socket.data;
    await this.gameEventService.setVote(roomId, data.vote);
  }

  // 투표 합.
  @SubscribeMessage(GameEvent.FinishV)
  async handleFinishVote(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const newNamespace = socket.nsp;

    const gamePlayers = await this.gameEventService.getPlayerJobs(roomId);

    let count;
    //count
    for (const player of gamePlayers) {
      if (player.id === user.id) {
        count = await this.gameEventService.setPlayerNum(roomId);
        break;
      }
    }

    if (gamePlayers.length === count) {
      await this.gameEventService.delPlayerNum(roomId);

      const vote = await this.gameEventService.getVote(roomId);
      const result = await this.gameEventService.sortfinishVote(roomId, vote);

      this.logger.log(result);

      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.FinishV, result);
    }
  }

  @SubscribeMessage(GameEvent.Punish)
  async handlePunish(
    @MessageBody() data: { punish: boolean },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { roomId } = socket.data;
    await this.gameEventService.setPunish(roomId, data.punish);
  }

  // punis = [];

  // 찬반투표
  @SubscribeMessage(GameEvent.FinishP)
  async handlePunishP(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const newNamespace = socket.nsp;

    const gamePlayers = await this.gameEventService.getPlayerJobs(roomId);

    let count;
    //count
    for (const player of gamePlayers) {
      if (player.id === user.id) {
        count = await this.gameEventService.setPlayerNum(roomId);
        break;
      }
    }

    if (gamePlayers.length === count) {
      await this.gameEventService.delPlayerNum(roomId);

      const agreement = await this.gameEventService.getPunish(roomId);
      // const Opposition = gamePlayers.length - Agreement;

      // 버전 1 , 찬성값만 주기
      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.FinishP, {Agreement: agreement});

      // 버전 1 , 찬성값만 주기
      // this.server.to(`${newNamespace.name}-${roomId}`).emit(GameEvent.FinishP, {
      //   voteResult: {
      //     Agreement: Agreement,
      //     Opposition: Opposition,
      //   },
      // });

      if (gamePlayers.length / 2 < agreement) {
        const humon = await this.gameEventService.getVoteDeath(roomId);
        this.logger.log(`죽이려는 대상의 번호가 맞나..? ${humon}`);


        //죽은 사람의 정보 제공.
        const death = await this.gameEventService.death(roomId, humon);
        this.server
          .to(`${newNamespace.name}-${roomId}`)
          .emit(GameEvent.Death, {death: death}); 
      }
    }
  }

  // 능력사용 부분
  // 경찰 능력
  @SubscribeMessage(GameEvent.Police)
  async handleUsePolice(
    @MessageBody() data: { userNum: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { roomId } = socket.data;
    const { user } = socket.request;

    const userJob = await this.gameEventService.usePolice(
      roomId,
      data.userNum,
      user,
    );

    this.server.to(socket.id).emit(GameEvent.Police, {userJob: userJob});
  }

  // 능력사용 부분
  // 마피아 능력
  @SubscribeMessage(GameEvent.Mafia)
  async handleUseMafia(
    @MessageBody() data: { userNum: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const {userNum } = data;

    const voteUserNum = await this.gameEventService.useMafia(roomId, userNum,user );

    this.server.to(socket.id).emit(GameEvent.Mafia, voteUserNum);
  }


 // 능력사용 부분
  // 의사
  @SubscribeMessage(GameEvent.Doctor)
  async handleUseDoctor(
    @MessageBody() data: { userNum: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const { userNum } = data;

    const voteUserNum = await this.gameEventService.useDoctor(roomId, userNum, user );

    this.server.to(socket.id).emit(GameEvent.Doctor, voteUserNum);
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

  // socket이 연결됐을 때
  async handleConnection(@ConnectedSocket() socket: AuthenticatedSocket) {
    // 생성될 때 소켓 인스턴스의 namespace,  id
    this.logger.log(
      `socket connected ${socket.nsp.name} ${socket.id} ${socket.data.roomId}`,
    );
  }
  // socket이 연결 끊겼을 때
  async handleDisconnect(@ConnectedSocket() socket: AuthenticatedSocket) {
    const newNamespace = socket.nsp;
    const { roomId } = socket.data;

    socket.leave(`${newNamespace.name}-${roomId}`);
    this.logger.log(`socket disconnected: ${socket.id}`);
  }

  afterInit(server: any) {
    this.logger.log('after init');
  }
}
