import { Injectable, Logger, Inject } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import dayjs from 'dayjs';
import { Player } from 'src/modules/game-room/dto/player';
import { RedisService } from 'src/modules/redis/redis.service';
import { UserProfile } from '../../user/dto/user-profile.dto';
import {
  DOCTOR_FIELD,
  FINISH_VOTE_FIELD,
  GAME,
  MAFIA_FIELD,
  PLAYERJOB_FIELD,
  PLAYERNUM_FIELD,
  PLAYER_FIELD,
  PUNISH_FIELD,
  VOTE_FIELD,
} from './constants/game-redis-key-prefix';

// 직업 부여 분리
@Injectable()
export class GameEventService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly redisService: RedisService,
  ) {}

  timer() {
    const now = dayjs();

    //시작 신호
    const startTime = now.format();
    this.logger.log(`start: ${startTime}`);

    //만료 신호
    const endTime = now.add(1, 's').format();
    this.logger.log(`end: ${endTime}`);

    return { start: startTime, end: endTime };
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

  // async findGame(roomId: number): Promise<GameRoom> {
  //   const game = await this.redisService.hget(
  //     this.makeGameKey(roomId),
  //     INFO_FIELD,
  //   );
  //   if (!game) {
  //     throw new WsException('존재하지 않는 게임입니다');
  //   }

  //   return game;
  // }

  async getPlayerJobs(roomId: number) {
    try {
      const playerJobs = await this.redisService.hget(
        this.makeGameKey(roomId),
        PLAYERJOB_FIELD,
      );
      this.logger.log(2);
      return playerJobs;
    } catch (err) {
      console.log(err);
    }
  }

  async setPlayerJobs(roomId: number, job: number[], Num: number) {
    const jobs = this.grantJob(job, Num);
    const playerJobs = await this.findPlayers(roomId);

    for (let i = 0; i < Num; i++) {
      playerJobs[i].job = jobs[i];
    }
    return await this.redisService.hset(
      this.makeGameKey(roomId),
      PLAYERJOB_FIELD,
      playerJobs,
    );
  }

  getJobData(playerCount: number) {
    const mafia = 1;
    const doctor = 1;
    const police = 1;

    const cr = playerCount < 4 ? 1 : playerCount - (mafia + doctor + police);

    const jobData = [cr, mafia, doctor, police];

    return jobData;
  }

  grantJob(job: number[], Num: number) {
    const grantJob = ['CITIZEN', 'MAFIA', 'DOCTOR', 'POLICE']; // 직업

    const roomJob = []; //해당 방의 직업
    let typesOfJobs = 0;
    for (let jobs = 0; jobs < Num; jobs++) {
      roomJob.push(grantJob[typesOfJobs]);
      job[jobs]--;

      if (!job[typesOfJobs]) typesOfJobs++;
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

    return strikeOut;
  }

  async sortfinishVote(roomId: number): Promise<any> {
    let redisVote = {};
    const vote = await this.getVote(roomId);

    // vote = await this.getVote(roomId);

    if (!vote) {
      return vote;
    }

    // 해당 숫자값 세주기
    vote.forEach((element) => {
      redisVote[element] = (redisVote[element] || 0) + 1;
    });

    redisVote = this.sortObject(redisVote, 'userNum', 'vote');

    await this.redisService.hset(
      this.makeGameKey(roomId),
      FINISH_VOTE_FIELD,
      redisVote,
    );

    return redisVote;
  }

  sortObject(obj, userNum: string, voteNum: string) {
    const arr = [];
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        arr.push({
          userNum: prop,
          voteNum: obj[prop],
        });
      }
    }
    arr.sort(function (a, b) {
      return b.voteNum - a.voteNum;
    });
    //arr.sort(function(a, b) { a.value.toLowerCase().localeCompare(b.value.toLowerCase()); }); //use this to sort as strings
    return arr; // returns array
  }

  async getVoteDeath(roomId: number) {
    const votehumon = await this.redisService.hget(
      this.makeGameKey(roomId),
      FINISH_VOTE_FIELD,
    );

    this.logger.log(votehumon);
    this.logger.log(`죽이려는 대상의 번호가 맞나..? ${votehumon[0]}`);

    return votehumon[0].userNum;
  }

  async death(roomId: number, userNum: number) {
    const gamePlayer = await this.getPlayerJobs(roomId);
    gamePlayer[userNum - 1].die = !gamePlayer[userNum - 1].die;

    this.redisService.hset(
      this.makeGameKey(roomId),
      PLAYERJOB_FIELD,
      gamePlayer,
    );

    return userNum;
  }

  async useState(roomId: number) {
    let mafiaNum;
    let doctorNum;
    let gamePlayer;

    try {
      mafiaNum = await this.redisService.hget(
        this.makeGameKey(roomId),
        MAFIA_FIELD,
      );
      doctorNum = await this.redisService.hget(
        this.makeGameKey(roomId),
        DOCTOR_FIELD,
      );
    } catch (error) {
      this.logger.log(`useState error `, error);
    }

    this.logger.log(mafiaNum);
    this.logger.log(doctorNum);
    if (mafiaNum && mafiaNum !== doctorNum) {
      // 마피아가 선택한 유저 죽음.
      gamePlayer = await this.getPlayerJobs(roomId);
      gamePlayer[mafiaNum].die = !gamePlayer[mafiaNum].die;
      await this.death(roomId, mafiaNum);
    } else if (!doctorNum) {
      this.logger.log('의사한테 값이 없어요.');
      return 0;
    } else if (!mafiaNum) {
      this.logger.log('마피아 한테 값이 없어요.');
      return 0;
    }

    this.logger.log(gamePlayer[mafiaNum].die);

    return { userNum: mafiaNum, die: gamePlayer[mafiaNum].die };
  }

  makeGameKey(roomId: number): string {
    return `${GAME}:${roomId}`;
  }

  async usePolice(
    roomId: number,
    userNum: number,
    user: UserProfile,
  ): Promise<string> {
    const gamePlayer = await this.getPlayerJobs(roomId);

    let userJob, police;

    for (const player of gamePlayer) {
      if (player.id === user.profile.id) {
        police = player.job;
      }

      userJob = gamePlayer[userNum].job;
    }

    if (police !== 'POLICE') {
      throw new WsException('경찰이 아닙니다.');
    } else {
      return userJob;
    }
  }

  async useMafia(
    roomId: number,
    userNum: number,
    user: UserProfile,
  ): Promise<number> {
    const gamePlayer = await this.getPlayerJobs(roomId);

    let mafia;
    // let voteUser;

    for (const player of gamePlayer) {
      if (player.id === user.profile.id) {
        mafia = player.job;
      }

      // voteUser = gamePlayer[userNum];
    }

    if (mafia !== 'MAFIA') {
      throw new WsException('마피아가 아닙니다.');
    }

    this.redisService.hset(this.makeGameKey(roomId), MAFIA_FIELD, userNum);

    return userNum;
  }

  async useDoctor(
    roomId: number,
    userNum: number,
    user: UserProfile,
  ): Promise<number> {
    const gamePlayer = await this.getPlayerJobs(roomId);

    let doctor;
    // let voteUser;

    for (const player of gamePlayer) {
      if (player.id === user.profile.id) {
        doctor = player.job;
      }

      // voteUser = gamePlayer[userNum];
    }

    if (doctor !== 'DOCTOR') {
      throw new WsException('의사가 아닙니다.');
    }

    this.redisService.hset(this.makeGameKey(roomId), DOCTOR_FIELD, userNum);

    return userNum;
  }

  //살아있는 각 팀멤버 수
  async livingHuman(roomId: number) {
    const gamePlayer = await this.redisService.hget(
      this.makeGameKey(roomId),
      PLAYERJOB_FIELD,
    );

    const livingMafia = gamePlayer.filter((player) => {
      return player.job === 'MAFIA' && player.die === false;
    }).length;

    const livingCitizen = gamePlayer.length - livingMafia;

    return { mafia: livingMafia, citizen: livingCitizen };
  }

  // winner(mafia: number, citizen: number) {
  //   this.logger.log(`winne 마피아 ${mafia}, 시민 ${citizen}`)

  //   if (!mafia) {
  //     return 'CITIZEN';
  //   } else if (mafia >= citizen) {
  //     return 'MAFIA';
  //   }
  //   return null;
  // }

  async winner(roomId: number) {
    const { mafia, citizen } = await this.livingHuman(roomId);

    if (!mafia) {
      return 'CITIZEN';
    } else if (mafia >= citizen) {
      return 'MAFIA';
    }
    return null;
  }

  async setVote(roomId: number, vote: number): Promise<any> {
    let votes = await this.getVote(roomId);

    if (!votes) votes = [];

    votes.push(vote);

    return await this.redisService.hset(
      this.makeGameKey(roomId),
      VOTE_FIELD,
      votes,
    );
  }

  async getPunish(roomId: number): Promise<any> {
    return await this.redisService.hget(this.makeGameKey(roomId), PUNISH_FIELD);
  }

  async getPunishSum(roomId: number) {
    const punish = await this.getPunish(roomId);

    this.logger.log(punish);

    const punisAgreement = punish.filter((item) => {
      return item === true;
    }).length;

    this.logger.log(punisAgreement);

    return punisAgreement;
  }

  async setPunish(roomId: number, punish: boolean): Promise<any> {
    let punishs = await this.getPunish(roomId);

    if (!punishs) punishs = [];
    punishs.push(punish);

    await this.redisService.hset(
      this.makeGameKey(roomId),
      PUNISH_FIELD,
      punishs,
    );
  }

  async getVote(roomId: number): Promise<number[]> {
    return await this.redisService.hget(this.makeGameKey(roomId), VOTE_FIELD);
  }

  async setPlayerNum(roomId: number) {
    return await this.redisService.hincrby(
      this.makeGameKey(roomId),
      PLAYERNUM_FIELD,
    );
  }

  async delPlayerNum(roomId: number) {
    return await this.redisService.hdel(
      this.makeGameKey(roomId),
      PLAYERNUM_FIELD,
    );
  }

  async delValue(roomId: number, value) {
    const key = await this.makeGameKey(roomId);

    switch (value) {
      case MAFIA_FIELD:
      case DOCTOR_FIELD:
        await this.redisService.hdel(key, MAFIA_FIELD);
        await this.redisService.hdel(key, DOCTOR_FIELD);
        break;
      case VOTE_FIELD:
      case FINISH_VOTE_FIELD:
      case PUNISH_FIELD:
        await this.redisService.hdel(key, VOTE_FIELD);
        await this.redisService.hdel(key, FINISH_VOTE_FIELD);
        await this.redisService.hdel(key, PUNISH_FIELD);
        break;
    }
  }
}
