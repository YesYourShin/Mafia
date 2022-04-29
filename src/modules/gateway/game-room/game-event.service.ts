import { Injectable, Logger, Inject } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { interval } from 'rxjs';
import { GameRoom } from 'src/modules/game-room/dto';
import { Player } from 'src/modules/game-room/dto/player';
import { RedisService } from 'src/modules/redis/redis.service';
import { GAME, INFO_FIELD, PLAYERJOB_FIELD, PLAYERNUM_FIELD, PLAYER_FIELD, VOTE_FIELD } from './constants';

// 직업 부여 분리
@Injectable()
export class GameEventService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly redisService: RedisService,
  ) {}

  async findGame(roomId: number): Promise<GameRoom> {
    const game = await this.redisService.hget(
      this.makeGameKey(roomId),
      INFO_FIELD,
    );
    if (!game) {
      throw new WsException('존재하지 않는 게임입니다');
    }

    return game;
  }

  // 해당 방의 게임 플레이어 값을 찾아서 제공.
  async findPlayers(roomId: number): Promise<Player[]> {
    const players = await this.redisService.hget(
      this.makeGameKey(roomId),
      PLAYER_FIELD,
    );

    if (!players) {
      throw new WsException('존재하지 않는 게임입니다');
    }

    return players;
  }

  // async findPlayer(roomId: number, playerId: number) {
  //   const players = await this.findPlayers(roomId);
  //   return this.getMemberInGameRoomMember(members, memberId);
  // }

  async getPlayerJobs(roomId: number){
    try {
      const playerJobs = await this.redisService.hget(
        this.makeGameKey(roomId),
        PLAYERJOB_FIELD
      )
      this.logger.log(2)
      return playerJobs

    }catch(err){
      console.log(err);
    }
  }
  
  async setPlayerJobs(roomId: number, job:number[], Num:number){
    const jobs = this.grantJob(job, Num);
    const playerJobs = await this.findPlayers(roomId);

   for(let i = 0; i < Num; i++){
     playerJobs[i].job = jobs[i];
   }
    return await this.redisService.hset(this.makeGameKey(roomId), PLAYERJOB_FIELD , playerJobs);
  }

  // setVote(roomId: number,){
  //   await this.redisService.hset(this.makeGameKey(room), VOTE_FIELD, {})
  // }

  grantJob(job: number[], Num: number){
    const grantJob = ['CITIZEN', 'MAFIA', 'DOCTOR', 'POLICE']; // 직업

    let roomJob = []; //해당 방의 직업
    let typesOfJobs = 0;
    for(let jobs = 0; jobs < Num; jobs++ ){
      roomJob.push(grantJob[typesOfJobs]);
      job[jobs]--;
      if(!job[typesOfJobs]) typesOfJobs++;
    }

    return this.shuffle(roomJob);
  }

  shuffle(job: string[]) {
    // 직업 셔플
    const strikeOut = [];
    while (job.length) {
      const lastidx = job.length - 1;
      const roll = Math.floor(Math.random() * job.length);
      const temp = job[lastidx];
      job[lastidx] = job[roll];
      job[roll] = temp;
      strikeOut.push(job.pop());
    }

    // this.logger.log(`grantjob ` + strikeOut);

    return strikeOut;
  }

  makeGameKey(roomId: number): string {
    return `${GAME}:${roomId}`;
  }

  async setPlayerNum(roomId: number) {
    return await this.redisService.hincrby(this.makeGameKey(roomId), PLAYERNUM_FIELD);
  }

  async getPlayerNum(roomId: number){
    return await this.redisService.hget(this.makeGameKey(roomId), PLAYERNUM_FIELD);
  }

  async delPlayerNum(roomId: number){
    return await this.redisService.hdel(this.makeGameKey(roomId), PLAYERNUM_FIELD);
  }

  async savePlayerJob(
    key: string,
    field: string,
    player: Player[],
  ): Promise<any> {
    return await this.redisService.hset(key, field, player);
  }

  usePoliceState(num: number, client: any[], user: string) {
    let u, job;
    client.filter((profession) => {
      if (user === profession.user) u = profession.job;
    });
    this.logger.log(`user : ${u}`);

    if (u !== 'POLICE') {
      return null;
    }

    client.filter((profession) => {
      if (num === profession.num) {
        this.logger.log(profession.job);
        job = profession.job;
      }
    });

    return job;
  }
}
