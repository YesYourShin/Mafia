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
import { GamePrefix } from 'src/modules/game-room/constants';
import { UserProfileInGame } from 'src/modules/game-room/dto';
import { REDIS_GAME } from 'src/modules/redis';
import { UserProfile } from 'src/modules/user/dto';
import { Event } from './constants';

// 여기를 통해 socket Server를 세팅 / 옵션들
// namespace - game
@WebSocketGateway({
  // path: '/socket.io' <- defaut path,
  transports: ['websocket'],
  cors: { origin: '*' },
  namespace: 'game',
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @InjectRedis(REDIS_GAME) private readonly redis: Redis, // private readonly gameService: GameService,
  ) {}
  @WebSocketServer() public server: Server;

  roomName = 'room1'; //방 이름.
  roomJob = []; //해당 방의 직업
  roomClient = []; // room인원
  gamePlayerNum = 0;

  // 시작 신호 보내기
  @SubscribeMessage('gameMessage')
  gamestart(@MessageBody() data: number, @ConnectedSocket() socket: Socket) {
    if (this.gamePlayerNum > 5) {
      setTimeout(() => {
        this.server
          .to(this.roomName)
          .emit('gameMessage', { status: 'ok', time: `${data}` });
        this.logger.log(`socketid: ${socket.id} , 발생 `);
      }, 1000 * data);
    }
  }

  // 방 join
  @SubscribeMessage('gamejoin')
  handleGamejoin(@ConnectedSocket() socket: Socket) {
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
      for (let item = 0; item < this.gamePlayerNum + 1; item++) {
        const ran = Math.floor(Math.random() * grantJob.length); //직업
        const jobCountData = this.roomJob.filter(
          (item) => item === grantJob[ran],
        ).length; //현재 같은 직업 수

        if (jobCountData < jobData[ran]) {
          this.roomJob.push(grantJob[ran]);
          const data = {
            user: Array.from(gamePlayers)[item],
            job: this.roomJob[item],
          };
          this.roomClient.push(data);
        } else {
          if (jobCountData === jobData[0]) break;
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

  // -----------------------------------------------------------------------------
  // // 방 입장
  // @SubscribeMessage(Event.JOIN)
  // async handleJoin(
  //   @MessageBody() data: { user: UserProfile; gameNumber: number },
  //   @ConnectedSocket() socket: Socket,
  // ) {
  //   const newNamespace = socket.nsp;
  //   socket.join(`${socket.nsp.name}-${data.gameNumber}`);
  //   // const members = await this.gameService.findMembers(data.gameNumber);
  //   // newNamespace.emit(Event.ONLINELIST, members);
  // }

  // 방 준비
  @SubscribeMessage(Event.READY)
  async handleReady(
    @MessageBody() data: { user: UserProfile; gameNumber: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = JSON.stringify(data.user);
    const newNamespace = socket.nsp;
    const isReady = await this.redis.sismember(
      `game:ready#${socket.nsp.name}`,
      user,
    );
    if (!isReady) {
      await this.redis.sadd(`game:ready#${socket.nsp.name}`, user);
      const members = await this.getGameRoomMemberList(
        `game:ready#${socket.nsp.name}`,
      );
      newNamespace.emit(Event.READY, members);
    }
  }

  // 방 준비X
  @SubscribeMessage(Event.UNREADY)
  async handleUnready(
    @MessageBody() data: { user: UserProfile; gameNumber: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = JSON.stringify(data.user);
    const newNamespace = socket.nsp;
    const isReady = await this.redis.sismember(
      `game:ready#${socket.nsp.name}`,
      user,
    );
    if (isReady) {
      await this.redis.srem(`game:ready#${socket.nsp.name}`, user);
      const members = await this.getGameRoomMemberList(
        `game:ready#${socket.nsp.name}`,
      );
      newNamespace.emit(Event.READY, members);
    }
  }

  // 시작
  @SubscribeMessage(Event.START)
  async handleStart(
    @MessageBody() data: { user: UserProfile; gameNumber: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const newNamespace = socket.nsp;
    const leader: UserProfileInGame = JSON.parse(
      await this.redis.lindex(
        `${GamePrefix.gameRoomMembers}${data.gameNumber}`,
        0,
      ),
    );
    if (data.user.id === leader.userId) {
      const readyCount = await this.redis.scard(
        `game:ready#${socket.nsp.name}`,
      );
      const memberCount = await this.redis.llen(
        `${GamePrefix.gameRoomMembers}${data.gameNumber}`,
      );
      if (memberCount === readyCount + 1) {
        newNamespace.emit(Event.START, {
          start: true,
          gameNumber: data.gameNumber,
        });
      } else {
        newNamespace.emit(Event.START, {
          start: false,
          gameNumber: data.gameNumber,
        });
      }
    } else {
      newNamespace.emit(Event.START, {
        start: false,
        gameNumber: data.gameNumber,
      });
    }
  }

  // 메세지
  @SubscribeMessage(Event.MESSAGE)
  async handleMessage(
    @MessageBody() data: { message: object },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.nsp.emit(Event.MESSAGE, data.message);
  }

  // 서버 메세지
  @SubscribeMessage(Event.SERVER_MESSAGE)
  async handleServerMessage(
    @MessageBody() data: { message: object },
    @ConnectedSocket() socket: Socket,
  ) {
    socket.nsp.emit(Event.SERVER_MESSAGE, data.message);
  }
  // socket이 연결됐을 때
  async handleConnection(@ConnectedSocket() socket: Socket) {
    // 생성될 때 소켓 인스턴스의 namespace,  id
    this.logger.log(`socket connected ${socket.nsp.name} ${socket.id}`);
    this.handleGamejoin(socket);
  }
  // socket이 연결 끊겼을 때
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`socket disconnected: ${socket.id}`);
    const members = await this.getGameRoomMemberList(
      `game:ready#${socket.nsp.name}`,
    );
    socket.nsp.emit(Event.LEAVE, members);
  }

  afterInit(server: any) {
    this.logger.log('after init');
  }

  async getGameRoomMemberList(key: string): Promise<UserProfile[]> {
    return (await this.redis.smembers(key)).map((member) => JSON.parse(member));
  }
}
