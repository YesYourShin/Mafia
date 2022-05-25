import { Injectable, Logger, Inject } from '@nestjs/common';
import { MessageBody, WsException } from '@nestjs/websockets';
import dayjs from 'dayjs';
import { Player } from 'src/modules/game-room/dto/player';
import { RedisService } from 'src/modules/redis/redis.service';
import { UserProfile } from '../../user/dto/user-profile.dto';
import {
  MAFIAS_FIELD,
  NUM_FIELD,
  PLAYERLELEAVE_FIELD,
} from './constants/game-redis-key-prefix';
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
import { EnumGameRole } from 'src/common/constants';
import { GameRepository } from 'src/modules/game/game.repository';

// 직업 부여 분리
@Injectable()
export class GameEventService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly redisService: RedisService,
    private readonly gameRepository: GameRepository,
  ) {}

  timer() {
    const now = dayjs();

    //시작 신호
    const startTime = now.format();
    this.logger.log(`start: ${startTime}`);

    //만료 신호
    const endTime = now.add(33, 's').format();
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

  async getPlayerJobs(roomId: number): Promise<Player[]> {
    try {
      const playerJobs = await this.redisService.hget(
        this.makeGameKey(roomId),
        PLAYERJOB_FIELD,
      );
      return playerJobs;
    } catch (err) {
      console.log(err);
    }
  }
  async setMafiaSearch(roomId: number, player: Player[]) {
    await this.redisService.hset(
      this.makeGameKey(roomId),
      MAFIAS_FIELD,
      player,
    );
  }

  async getMafiaSearch(roomId: number): Promise<Player[]> {
    return await this.redisService.hget(this.makeGameKey(roomId), MAFIAS_FIELD);
  }

  async leaveUser(roomId: number, user: UserProfile) {
    this.logger.log(`leaveUser event`);
    const gamePlayer: Player[] = await this.getPlayerJobs(roomId);
    let leaveplayer;

    const newGamePlayer = gamePlayer.map((player) => {
      if (player.userId === user.id) {
        leaveplayer = player;
        player = null;
      }
      return player;
    });

    this.logger.log(`leave 유저 gameId ${leaveplayer.gameId}`);
    // 탈주 유저  redis 처리
    await this.setLeaveUser(roomId, leaveplayer);

    await this.gameRepository.leave(leaveplayer);

    //  player 저장
    await this.redisService.hset(
      this.makeGameKey(roomId),
      PLAYERJOB_FIELD,
      newGamePlayer,
    );

    this.logger.log(`leaveplayer`);
    // this.logger.log(leaveplayer);

    return leaveplayer;
  }

  async setLeaveUser(roomId: number, player: Player) {
    const leaveusers =
      (await this.redisService.hget(
        this.makeGameKey(roomId),
        PLAYERLELEAVE_FIELD,
      )) || [];

    // this.logger.log(leaveusers);

    leaveusers.push(player);

    if (leaveusers) {
      this.logger.log('leaveusers reids에 넣기');
      this.logger.log(leaveusers);
    } else {
      this.logger.log('값이 없어요...');
    }

    return this.redisService.hset(
      this.makeGameKey(roomId),
      PLAYERLELEAVE_FIELD,
      leaveusers,
    );
  }

  async setPlayerJobs(roomId: number, job: number[], Num: number) {
    const jobs = this.grantJob(job, Num);
    const playerJobs = await this.findPlayers(roomId);
    const mafias = [];

    for (let i = 0; i < Num; i++) {
      playerJobs[i].job = jobs[i];
      if (playerJobs[i].job === EnumGameRole.MAFIA) {
        playerJobs[i].team = EnumGameRole.MAFIA;
        mafias.push(playerJobs[i]);
        continue;
      }
      playerJobs[i].team = EnumGameRole.CITIZEN;
    }

    await this.setMafiaSearch(roomId, mafias);

    await this.redisService.hset(
      this.makeGameKey(roomId),
      PLAYERJOB_FIELD,
      playerJobs,
    );

    await this.gameRepository.setRole(playerJobs);
  }

  getJobData(playerCount: number) {
    const mafia = playerCount > 6 ? 2 : 1;
    const doctor = 1;
    const police = 1;

    const cr = playerCount < 4 ? 1 : playerCount - (mafia + doctor + police);

    const jobData = [cr, mafia, doctor, police];

    this.logger.log('jobData');
    this.logger.log(jobData);
    return jobData;
  }

  grantJob(job: number[], Num: number) {
    const grantJob = [
      EnumGameRole.CITIZEN, //0
      EnumGameRole.MAFIA, //1
      EnumGameRole.DOCTOR, //2
      EnumGameRole.POLICE, //3
    ]; // 직업

    //시민 3 , 마피아1, 의사1, 경찰1

    const roomJob = []; //해당 방의 직업
    let typesOfJobs = 0;
    for (let jobs = 0; jobs < Num; jobs++) {
      this.logger.log('grantJob');
      roomJob.push(grantJob[typesOfJobs]);
      this.logger.log(`직업 배분 배열에 넣기 ${jobs} ${grantJob[typesOfJobs]}`);
      job[typesOfJobs]--;
      this.logger.log(`직업 배분 값 빼기 ${jobs} ${job[typesOfJobs]}`);

      if (!job[typesOfJobs]) typesOfJobs++;

      this.logger.log(`현재 직업 배분 typesOfjobs ${jobs} ${typesOfJobs}`);
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

  async sortfinishVote(roomId: number) {
    let redisVote = {};
    const vote = await this.getVote(roomId);

    if (!vote) {
      return null;
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

    return gamePlayer[userNum - 1];
  }

  async useState(roomId: number) {
    try {
      const mafiaNum = await this.redisService.hget(
        this.makeGameKey(roomId),
        MAFIA_FIELD,
      );
      const doctorNum = await this.redisService.hget(
        this.makeGameKey(roomId),
        DOCTOR_FIELD,
      );
      if (!mafiaNum) return null;

      if (mafiaNum !== doctorNum) {
        await this.death(roomId, mafiaNum);
      }

      const gamePlayer = await this.getPlayerJobs(roomId);

      // Todo 메세지를 주도록, 살해했습니다.
      this.logger.log(gamePlayer[mafiaNum - 1].die);
      return { userNum: mafiaNum, die: gamePlayer[mafiaNum - 1].die };
    } catch (error) {
      this.logger.error(`useState error `, error);
    }
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

    let police;

    for (const player of gamePlayer) {
      if (player.id === user.profile.id) {
        police = player.job;
        break;
      }
    }

    if (police !== EnumGameRole.POLICE) {
      throw new WsException('경찰이 아닙니다.');
    } else {
      return gamePlayer[userNum].job;
    }
  }

  async useMafia(
    roomId: number,
    userNum: number,
    user: UserProfile,
  ): Promise<number> {
    const gamePlayer = await this.getPlayerJobs(roomId);

    for (const player of gamePlayer) {
      if (player.id === user.profile.id && player.job !== EnumGameRole.MAFIA) {
        throw new WsException('마피아가 아닙니다.');
      }
    }

    await this.redisService.hset(
      this.makeGameKey(roomId),
      MAFIA_FIELD,
      userNum,
    );

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

    if (doctor !== EnumGameRole.DOCTOR) {
      throw new WsException('의사가 아닙니다.');
    }

    await this.redisService.hset(
      this.makeGameKey(roomId),
      DOCTOR_FIELD,
      userNum,
    );

    return userNum;
  }

  //살아있는 각 팀멤버 수
  async livingHuman(roomId: number) {
    const gamePlayer = await this.redisService.hget(
      this.makeGameKey(roomId),
      PLAYERJOB_FIELD,
    );

    const livingMafia = gamePlayer.filter((player) => {
      return player.job === EnumGameRole.MAFIA && player.die === false;
    }).length;

    const livingCitizen = gamePlayer.length - livingMafia;

    return { mafia: livingMafia, citizen: livingCitizen };
  }

  // Todo 죽은 사람, 탈주 유저의 수 redis로 따로 빼서 체크.
  async setPlayerCheckNum(roomId: number, user: UserProfile) {
    const gamePlayers = await this.getPlayerJobs(roomId);
    let playerSum = gamePlayers.length;

    let count;
    for (const player of gamePlayers) {
      if (player === null) {
        playerSum--;
      }
      if (player.id === user.profile.id) {
        count = await this.setPlayerNum(roomId);
        break;
      }
    }

    this.logger.log(`총 인원 ${playerSum}, count ${count}`);

    return { playerSum: gamePlayers.length, count: count };
  }

  async CheckNum(roomId: number, user) {
    const gamePlayers = await this.getPlayerJobs(roomId);

    let count;
    for (const player of gamePlayers) {
      if (player.id === user.profile.id) {
        count = await this.setNum(roomId);
        break;
      }
    }

    return { playerSum: gamePlayers.length, count: count };
  }

  async setNum(roomId: number) {
    return await this.redisService.hincrby(this.makeGameKey(roomId), NUM_FIELD);
  }

  async delNum(roomId: number) {
    return await this.redisService.hdel(this.makeGameKey(roomId), NUM_FIELD);
  }

  async winner(roomId: number): Promise<EnumGameRole> | null {
    const { mafia, citizen } = await this.livingHuman(roomId);

    if (!mafia) {
      return EnumGameRole.CITIZEN;
    } else if (mafia >= citizen) {
      return EnumGameRole.MAFIA;
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

    return await this.redisService.hset(
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
    const key = this.makeGameKey(roomId);

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

  async SaveTheEntireGame(roomId: number, winner: EnumGameRole) {
    const gamePlayer = await this.getPlayerJobs(roomId);

    return await this.gameRepository.saveGameScore(gamePlayer, winner);
  }
}
