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
import { WsAuthenticatedGuard } from '../guards/ws.authenticated.guard';
import { GameEvent } from './constants/game-event';
import {
  FINISH_VOTE_FIELD,
  MAFIA_FIELD,
} from './constants/game-redis-key-prefix';
import { AuthenticatedSocket } from '../game-room/constants/authenticated-socket';
import { GameEventService } from './game-event.service';
import { GamePlayerGuard } from '../guards/game-player.guard';

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
  @SubscribeMessage(GameEvent.JOIN)
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
      this.server.in(socket.id).emit(GameEvent.JOIN, user);
    } catch (error) {
      this.logger.error('socket join event error', error);
    }
  }

  @SubscribeMessage(GameEvent.TIMER)
  async handleTimer(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const newNamespace = socket.nsp;

    const Players = await this.gameEventService.findPlayers(roomId);

    let count;
    for (const player of Players) {
      if (player.id === user.profile.id) {
        count = await this.gameEventService.setPlayerNum(roomId);
      }
    }

    if (Players.length === count) {
      await this.gameEventService.delPlayerNum(roomId);
      const { start, end } = this.gameEventService.timer();

      try {
        this.server
          .in(`${newNamespace.name}-${roomId}`)
          .emit(GameEvent.TIMER, { start: start }, { end: end });
      } catch (error) {
        this.logger.error('event error', error);
      }
    }
  }

  @SubscribeMessage(GameEvent.WINNER)
  async handleWinner(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    const winner = await this.gameEventService.winner(roomId);

    if (!winner) return null;

    this.logger.log(`우승 ${winner}`);
    this.server.in(socket.id).emit(GameEvent.WINNER, { winner: winner });

    await this.gameEventService.SaveTheEntireGame(roomId, winner);
    this.server
      .in(`${newNamespace.name}-${roomId}`)
      .emit(GameEvent.WINNER, { winner: winner });
  }

  @SubscribeMessage(GameEvent.DAY)
  async HandleDay(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { day: boolean },
  ) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const newNamespace = socket.nsp;
    this.logger.log(data.day);

    // Todo 나갈 때, 승리 조건을 체크,
    // 승리조건
    // const winner = await this.gameEventService.winner(roomId);

    const Players = await this.gameEventService.findPlayers(roomId);
    // if (gamePlayers.length < 6)
    //   //  throw new ForbiddenException()
    //   throw new ForbiddenException('인원이 부족합니다.');

    this.logger.log(Players);

    let count;
    //count
    for (const player of Players) {
      if (player.id === user.profile.id) {
        count = await this.gameEventService.setPlayerNum(roomId);
      }
    }

    if (Players.length === count) {
      this.logger.log(`현재 day값 : ${data.day}`);
      await this.gameEventService.delPlayerNum(roomId);
      // if (winner) {
      //   this.logger.log(`우승 ${winner}`);
      //   this.server.in(socket.id).emit(GameEvent.WINNER, { winner: winner });

      //   await this.gameEventService.SaveTheEntireGame(roomId, winner);
      //   this.server
      //     .in(`${newNamespace.name}-${roomId}`)
      //     .emit(GameEvent.WINNER, { winner: winner });
      // } else {
      // default - 밤 = false
      const winner = await this.handleWinner(socket);

      if (!winner) {
        const thisDay = !data.day;
        this.logger.log(`바뀐 day값 : ${thisDay}`);
        this.server
          .in(`${newNamespace.name}-${roomId}`)
          .emit(GameEvent.DAY, { day: thisDay });
      }
      // }
    }
  }

  //이겼을 시, 게임 정보 db에 저장하는 부분 로직도 짜야함.

  @SubscribeMessage(GameEvent.START)
  async handleStart(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const newNamespace = socket.nsp;

    const Players = await this.gameEventService.findPlayers(roomId);
    // if (gamePlayers.length < 6)
    //   //  throw new ForbiddenException()
    //   throw new ForbiddenException('인원이 부족합니다.');

    this.logger.log(Players);

    let count;
    //count
    for (const player of Players) {
      if (player.id === user.profile.id) {
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
          .emit(GameEvent.START, Players);
      }, 1000);

      const jobData = this.gameEventService.getJobData(Players.length);
      await this.gameEventService.PlayerJobs(roomId, jobData, Players.length);
    }
  }

  // 각자의 직업만 제공
  @SubscribeMessage(GameEvent.JOB)
  async handleGrantJob(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { user } = socket.request;
    const { roomId } = socket.data;

    // 현재 방의 인원
    const players = await this.gameEventService.findPlayers(roomId);

    // 특정 플레이어의 순서 === jobs[순서]
    const gamePlayer = await this.gameEventService.getPlayerJobs(roomId);

    // for (let i = 0; i < players.length; i++) {
    //   if (players[i].id === user.profile.id) {
    //     players[i].job = gamePlayer[i].job;
    //     break;
    //   }
    // }

    players.forEach((player, idx) => {
      if (player.userId === user.id) {
        player.job = gamePlayer[idx].job;
      }
    });

    this.logger.log(`socket.id: ${socket.id}`);
    this.server.in(socket.id).emit(GameEvent.JOB, players);
  }

  @SubscribeMessage(GameEvent.USEJOBS)
  async HandleUseJobs(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const newNamespace = socket.nsp;

    const { playerSum, count } = await this.gameEventService.setPlayerCheckNum(
      roomId,
      user,
    );

    if (playerSum === count) {
      await this.gameEventService.delPlayerNum(roomId);

      const status = await this.gameEventService.useState(roomId);

      this.server
        .in(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.USEJOBS, status);

      await this.gameEventService.delValue(roomId, MAFIA_FIELD);
    }
  }

  //투표
  @SubscribeMessage(GameEvent.VOTE)
  async handleVote(
    @MessageBody() data: { vote: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const newNamespace = socket.nsp;

    const { playerSum, count } = await this.gameEventService.CheckNum(
      roomId,
      user,
    );

    // Todo 탈주/죽음/실존 플레이어 유효성 체크
    // Todo 죽은 사람을 투표 / 죽은 사람이 투표 유효성 체크 ok
    const vote = await this.gameEventService.voteValidation(roomId, data.vote);

    if (count <= playerSum) {
      if (vote) {
        this.logger.log(`1. 소켓투표값 ${vote}`);
        await this.gameEventService.setVote(roomId, vote);
      }
    }

    const redisVote = {};
    const result = await this.gameEventService.getVote(roomId);

    if (!vote) {
      return null;
    }

    // 해당 숫자값 세주기
    result.forEach((element) => {
      redisVote[element] = (redisVote[element] || 0) + 1;
    });

    this.server
      .to(`${newNamespace.name}-${roomId}`)
      .emit(GameEvent.CURRENT_VOTE, result);
  }

  // 투표 합.
  @SubscribeMessage(GameEvent.FINISHV)
  async handleFinishVote(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const newNamespace = socket.nsp;

    // Todo 1일차 낮 투표, 1일차 낮 찬성. 나주엥 리펙토링
    const { playerSum, count } = await this.gameEventService.setPlayerCheckNum(
      roomId,
      user,
    );

    if (playerSum === count) {
      this.logger.log(`투표 합, 총 인원 ${playerSum}, count ${count}`);
      await this.gameEventService.delPlayerNum(roomId);
      await this.gameEventService.delNum(roomId);

      const result = await this.gameEventService.sortfinishVote(roomId);

      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.FINISHV, result);
    }
  }

  // 무효표는 false로 받음.
  @SubscribeMessage(GameEvent.PUNISH)
  async handlePunish(
    @MessageBody() data: { punish: boolean },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    this.logger.log(`handlePunish`);
    this.logger.log(`data.punish 값 ${data.punish}`);
    const { roomId } = socket.data;
    const { user } = socket.request;

    const { playerSum, count } = await this.gameEventService.CheckNum(
      roomId,
      user,
    );

    // Todo 탈주/죽음/실존 플레이어 유효성 체크 [이벤트에서]
    if (count <= playerSum) {
      if (data.punish) {
        await this.gameEventService.setPunish(roomId, data.punish);
      }
    }
  }

  // 찬반투표
  @SubscribeMessage(GameEvent.FINISHP)
  async handlePunishP(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const { user } = socket.request;
    const newNamespace = socket.nsp;

    const { playerSum, count } = await this.gameEventService.setPlayerCheckNum(
      roomId,
      user,
    );

    if (playerSum === count) {
      await this.gameEventService.delPlayerNum(roomId);

      // Todo 네트워크는 느린데, 소켓은 안 끊길 때,
      const agreement = await this.gameEventService.getPunishSum(roomId);
      // const Opposition = gamePlayers.length - Agreement;

      // 버전 1 , 찬성값만 주기
      this.server
        .to(`${newNamespace.name}-${roomId}`)
        .emit(GameEvent.FINISHP, agreement);

      // 버전 2 , 찬성값만 주기
      // this.server.to(`${newNamespace.name}-${roomId}`).emit(GameEvent.FinishP, {
      //   voteResult: {
      //     Agreement: Agreement,
      //     Opposition: Opposition,
      //   },
      // });

      if (playerSum / 2 < agreement) {
        const humon = await this.gameEventService.getVoteDeath(roomId);
        this.logger.log(`죽이려는 대상의 번호가 맞나..? ${humon}`);

        //죽은 사람의 정보 제공
        const death = await this.gameEventService.death(roomId, humon);
        this.server
          .to(`${newNamespace.name}-${roomId}`)
          .emit(GameEvent.DEATH, death);
      }

      await this.gameEventService.delValue(roomId, FINISH_VOTE_FIELD);
    }
  }

  // 능력사용 부분
  // 경찰 능력
  @SubscribeMessage(GameEvent.POLICE)
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

    this.server.to(socket.id).emit(GameEvent.POLICE, { userJob: userJob });
  }

  @SubscribeMessage(GameEvent.MAFIASEARCH)
  async handleMafiaSerach(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    this.logger.log(`MAFIASEARCH 실행`);

    const mafias = await this.gameEventService.getMafiaSearch(roomId);

    this.server.to(socket.id).emit(GameEvent.MAFIASEARCH, { mafia: mafias });
  }

  // 능력사용 부분
  // 마피아 능력
  @SubscribeMessage(GameEvent.MAFIA)
  async handleUseMafia(
    @MessageBody() data: { userNum: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { roomId } = socket.data;
    const { user } = socket.request;

    // Todo 여러명의 마피아의 동일한 값일 경우만, 체크
    const voteUserNum = await this.gameEventService.useMafia(
      roomId,
      data.userNum,
      user,
    );

    this.server.to(socket.id).emit(GameEvent.MAFIA, voteUserNum);
  }

  // 능력사용 부분
  // 의사
  @SubscribeMessage(GameEvent.DOCTOR)
  async handleUseDoctor(
    @MessageBody() data: { userNum: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { roomId } = socket.data;
    const { user } = socket.request;

    const voteUserNum = await this.gameEventService.useDoctor(
      roomId,
      data.userNum,
      user,
    );

    this.server.to(socket.id).emit(GameEvent.DOCTOR, voteUserNum);
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
  @SubscribeMessage(GameEvent.SPEAK)
  async handleSpeak(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: { userId: number; nickname: string; speaking: boolean },
  ) {
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;

    this.server
      .to(`${newNamespace.name}-${roomId}`)
      .emit(GameEvent.SPEAK, data);
  }

  @SubscribeMessage(GameEvent.LEAVE)
  async handleLeave(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket.data;
    const newNamespace = socket.nsp;
    const { user } = socket.request;

    // 서비스 제공.
    const leaveUser = await this.gameEventService.leaveUser(roomId, user);

    this.server
      .to(`${newNamespace.name}-${roomId}`)
      .emit(GameEvent.LEAVE, leaveUser);
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
    const { user } = socket.request;

    this.logger.log(`socket disconnected: ${roomId} ${newNamespace}`);

    await this.handleLeave(socket);

    // Todo 나갈 때, 승리 조건을 체크,
    this.handleWinner(socket);

    socket.leave(`${newNamespace.name}-${roomId}`);
  }

  afterInit(server: any) {
    this.logger.log('after init');
  }
}
