import { Injectable, Logger, Inject } from '@nestjs/common';
import { MessageBody, WsException } from '@nestjs/websockets';
import { Player } from 'src/modules/game-room/dto/player';
import { RedisService } from 'src/modules/redis/redis.service';
import { UserProfile } from '../../user/dto/user-profile.dto';
import {
  MAFIAS_FIELD,
  NUM_FIELD,
  EXLEAVE_FIELD,
  EXDIE_FIELD,
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
import 'dayjs/locale/ko';
import dayjs from 'dayjs';
import { DAY_FIELD } from './constants/game-redis-key-prefix';
dayjs.locale('ko');

// 직업 부여 분리
@Injectable()
export class GameEventService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    private readonly redisService: RedisService,
    private readonly gameRepository: GameRepository,
  ) {}

  // timer() {
  //   const now = dayjs();

  //   const endTime = now.add(10, 's');
  //   this.logger.log(`end: ${endTime}`);
  //   return { start: startTime, end: endTime };
  // }

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

  async PlayerJobs(roomId: number, job: number[], Num: number) {
    const jobs = this.grantJob(job, Num); //직업 배분
    const playerJobs = await this.findPlayers(roomId);
    const mafias = [];

    for (let i = 0; i < Num; i++) {
      // 직업 배분,
      playerJobs[i].job = jobs[i];
      // 해당 유저의 직업이 마피아일 시!
      if (playerJobs[i].job === EnumGameRole.MAFIA) {
        playerJobs[i].team = EnumGameRole.MAFIA; //마피아 팀 저장.
        mafias.push(playerJobs[i]); //마피아 저장
        continue;
      }

      playerJobs[i].team = EnumGameRole.CITIZEN; //시민 팀 저장.
    }

    this.logger.log(`직업 유저 저장`);
    this.logger.log(playerJobs);

    await this.setMafiaSearch(roomId, mafias); //reids 마피아 저장.

    await this.setPlayerJob(roomId, playerJobs); //reids 직업유저 저장.

    await this.gameRepository.setRole(playerJobs); //db 직업 유저 저장.
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
      EnumGameRole.CITIZEN,
      EnumGameRole.MAFIA,
      EnumGameRole.DOCTOR,
      EnumGameRole.POLICE,
    ];

    const roomJob = []; //해당 방의 직업
    let typesOfJobs = 0;
    for (let jobs = 0; jobs < Num; jobs++) {
      this.logger.log('grantJob');
      roomJob.push(grantJob[typesOfJobs]);
      job[typesOfJobs]--;

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

  async sortfinishVote(roomId: number) {
    let redisVote = {};
    let message;
    let result = true;
    const vote = await this.getVote(roomId);

    if (!vote) {
      message = '아무도 지목당하지 않았습니다.';
      result = false;
      return { result: result, message: message, voteResult: null };
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

    if (redisVote[0].voteNum === redisVote[1].voteNum) {
      message = '동률 입니다.';
      result = false;
      return { result: false, message: message, voteResult: redisVote };
    }

    return { result: true, message: message, voteResult: redisVote };
  }

  sortObject(obj, userNum: string, voteNum: string) {
    const arr = [];
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        arr.push({
          userNum: +prop,
          voteNum: obj[prop],
        });
      }
    }
    arr.sort(function (a, b) {
      return b.voteNum - a.voteNum;
    });
    return arr;
  }

  // 죽이려는 대상의 번호 리턴
  async getVoteDeath(roomId: number) {
    const votehumon = await this.redisService.hget(
      this.makeGameKey(roomId),
      FINISH_VOTE_FIELD,
    );

    this.logger.log(votehumon);
    this.logger.log(`EVENT getVoteDeath , 죽이려는 대상: ${votehumon[0]}`);

    return votehumon[0].userNum;
  }

  async death(roomId: number, userNum: number) {
    const gamePlayer = await this.getPlayerJobs(roomId);
    const dieUser = gamePlayer[userNum - 1];

    // die - false 살아있음.
    // 유저의 값이
    if (dieUser.die) {
      throw new WsException('이미 죽은 유저입니다.');
    }
    this.logger.log(`EVENT death 죽기 전 fasle여야함., ${dieUser.die}`);

    dieUser.die = !dieUser.die;

    this.logger.log(`EVENT death 죽은 후 true여야함., ${dieUser.die}`);

    await this.redisService.hset(
      this.makeGameKey(roomId),
      PLAYERJOB_FIELD,
      gamePlayer,
    );

    await this.setDie(roomId, dieUser);

    return dieUser;
  }

  async usePolice(roomId: number, userNum: number, user: UserProfile) {
    const gamePlayer = await this.getPlayerJobs(roomId);
    const selectUserNum = gamePlayer[userNum - 1]; //직업이 궁금한 유저정보

    let police;

    this.logger.log(`usePolice 현재 유저 닉네임${user.profile.nickname}`);

    for (const player of gamePlayer) {
      if (player.userId === user.id) {
        police = player.job;
        break;
      }
    }

    if (police !== EnumGameRole.POLICE) {
      throw new WsException('경찰이 아닙니다.');
    }
    // 해당 유저가 고른 유저의 직업 제공.
    // 직업 + 메세지

    this.logger.log(
      `usePolice 메세지 반환 유저 닉네임${user.profile.nickname}`,
    );

    return {
      user: selectUserNum,
      message: `이 유저의 직업은 ${selectUserNum.job} 입니다.`,
    };
  }

  async useMafia(
    roomId: number,
    userNum: number,
    user: UserProfile,
  ): Promise<number> {
    const gamePlayer = await this.getPlayerJobs(roomId);
    const maifas = await this.getMafiaSearch(roomId);
    const mafiavotes = (await this.getMafia(roomId)) || [];

    // let mafia;
    this.logger.log(`gameEvent useMafia 유저 값 ${user.profile.nickname}`);

    // 마피아일 경우에만 값 넣기
    for (const player of maifas) {
      if (player.userId === user.id) {
        mafiavotes.push(userNum);
        break;
      }
    }

    // for (const player of gamePlayer) {
    //   if (player.userId === user.id && player.job !== EnumGameRole.MAFIA) {
    //     throw new WsException('마피아가 아닙니다.');
    //   }
    // }

    this.logger.log(`마피아 투표 값: ${userNum}`);

    await this.setMafia(roomId, mafiavotes);

    return userNum;
  }

  async useDoctor(
    roomId: number,
    userNum: number,
    user: UserProfile,
  ): Promise<number> {
    const gamePlayer = await this.getPlayerJobs(roomId);

    this.logger.log(`gameEvent useDoctor 유저 값 ${user.profile.nickname}`);

    for (const player of gamePlayer) {
      if (player.userId === user.id && player.job !== EnumGameRole.DOCTOR) {
        throw new WsException('의사가 아닙니다.');
      }
    }

    this.logger.log(`의사 투표 값: ${userNum}`);

    await this.setDoctor(roomId, userNum);

    return userNum;
  }

  async useState(roomId: number) {
    const gamePlayer = await this.getPlayerJobs(roomId);
    const mafias = await this.getMafiaSearch(roomId);

    const mafiavotes = await this.getMafia(roomId);
    const set = Array.from(new Set(mafiavotes));

    let message;

    try {
      //마피아 값이, 중복제거 값과 같을 시에 마피아 값 들어감. 아닐 시 null 발생
      const mafiaNum = mafias.length === set.length ? +set[0] : null;

      const doctorNum = await this.getDoctor(roomId);

      this.logger.log(
        `service useState 마피아 값: ${mafiaNum}, 의사 값: ${doctorNum}`,
      );

      let userDie = gamePlayer[mafiaNum - 1];

      //Todo mafia랑 doctor값이 둘다 null일 경우 제외,

      if (!mafiaNum) {
        // 아무 이벤트도 안 일어날 시,
        this.logger.log(`아무도 죽지 않아요`);
        message = '평화로운 밤이었습니다. 아무도 죽지 않았습니다';

        return { user: null, message: message };
      }

      // 마피아가 죽일 때
      if (mafiaNum !== doctorNum) {
        this.logger.log(
          `마피아가 ${mafiaNum} ${userDie.nickname} 을 죽였습니다.`,
        );
        userDie = await this.death(roomId, mafiaNum);
        message = `마피아가 ${userDie.nickname} 을/를 죽였습니다.`;
      }

      if (mafiaNum === doctorNum) {
        // 의사가 살릴 시
        this.logger.log(
          `의사가 ${mafiaNum} ${userDie.nickname} 을 살렸습니다.`,
        );
        message = `의사가 ${userDie.nickname} 을/를 살렸습니다.`;
      }

      this.logger.log(
        `service useState 유저 : ${userDie.nickname} , 죽음 값: ${userDie.die}`,
      );

      // Todo 마피아 값이 맞을 시, userNum : 값
      // Todo 마피아 값이 맞지 않을 시, userNum : null
      return { user: userDie, message: message };
    } catch (error) {
      this.logger.error(`useState error `, error);
    }
  }

  //살아있는 각 팀멤버 수
  async livingHuman(roomId: number) {
    const gamePlayer = await this.redisService.hget(
      this.makeGameKey(roomId),
      PLAYERJOB_FIELD,
    );

    const livingMafia = gamePlayer.filter((player) => {
      if (
        player !== null &&
        player.team === EnumGameRole.MAFIA &&
        player.die === false
      ) {
        return true;
      }
    }).length;

    const livingCitizen = gamePlayer.filter((player) => {
      if (
        player !== null &&
        player.team === EnumGameRole.CITIZEN &&
        player.die === false
      ) {
        return true;
      }
    }).length;

    return { mafia: livingMafia, citizen: livingCitizen };
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

  async leaveUser(roomId: number, user: UserProfile) {
    this.logger.log(`leaveUser event`);
    const gamePlayer: Player[] = await this.getPlayerJobs(roomId);
    let leaveplayer;

    const newGamePlayer = gamePlayer.map((player) => {
      if (player !== null && player.userId === user.id) {
        leaveplayer = player;
        player = null;
      }
      return player;
    });

    this.logger.log(`leave 유저 gameId ${leaveplayer.nickname}`);
    // 탈주 유저  redis 처리
    await this.setLeave(roomId, leaveplayer);

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

  async SaveTheEntireGame(roomId: number, winner: EnumGameRole) {
    const gamePlayer = await this.getPlayerJobs(roomId);

    this.logger.log(`EVNET, SaveTheEntireGame 게임 끝! 저장할게요.`);

    // 탈주 처리된 값 제외 후, 저장플레이어 추출.
    const saveplayer = gamePlayer.filter((x): x is Player => x !== null);

    return await this.gameRepository.saveGameScore(saveplayer, winner);
  }

  // Todo 죽은 사람, 탈주 유저의 수 redis로 따로 빼서 체크.
  async setPlayerCheckNum(roomId: number, user: UserProfile) {
    const players = await this.getPlayerJobs(roomId);
    const playerDie = (await this.getDie(roomId)) || [];
    const playerLeave = (await this.getLeave(roomId)) || [];

    let count;
    for (const player of players) {
      if (player.userId === user.id) {
        count = await this.setPlayerNum(roomId);
        break;
      }
    }
    const playerSum = players.length - (playerDie.length + playerLeave.length);

    this.logger.log(
      `EVENT setPlayerCheckNum, 총 인원 ${players.length}, count ${playerDie.length}, count ${playerLeave.length}`,
    );

    return { playerSum: playerSum, count: count };
  }

  async setPlayerCheckNumExceptLeave(roomId: number, user: UserProfile) {
    const players = await this.getPlayerJobs(roomId);
    const playerLeave = (await this.getLeave(roomId)) || [];

    let count;
    for (const player of players) {
      if (player.userId === user.id) {
        count = await this.setPlayerNum(roomId);
        break;
      }
    }

    const playerSum = players.length - playerLeave.length;

    this.logger.log(
      `EVENT setPlayerCheckNumExceptLeave, 총 인원 ${playerSum},  count ${count}`,
    );

    return { playerSum: playerSum, count: count };
  }

  async CheckNum(roomId: number, user) {
    const players = await this.getPlayerJobs(roomId);
    const playerDie = (await this.getDie(roomId)) || [];
    const playerLeave = (await this.getLeave(roomId)) || [];

    let count;
    for (const player of players) {
      if (player.id === user.profile.id) {
        count = await this.setNum(roomId);
        break;
      }
    }

    const playerSum = players.length - (playerDie.length - playerLeave.length);

    this.logger.log(`EVENT CheckNum, 총 인원 ${playerSum},  count ${count}`);

    return { playerSum: playerSum, count: count };
  }

  makeGameKey(roomId: number): string {
    return `${GAME}:${roomId}`;
  }

  async setDay(roomId: number, day: boolean) {
    await this.redisService.hset(this.makeGameKey(roomId), DAY_FIELD, day);
  }

  async getDay(roomId: number) {
    return await this.redisService.hget(this.makeGameKey(roomId), DAY_FIELD);
  }

  async setPunish(roomId: number, punish: boolean): Promise<any> {
    const punishs = (await this.getPunish(roomId)) || [];

    punishs.push(punish);

    return await this.redisService.hset(
      this.makeGameKey(roomId),
      PUNISH_FIELD,
      punishs,
    );
  }

  async getPunishSum(roomId: number) {
    const punish = (await this.getPunish(roomId)) || [];

    return punish.length;
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

  async setNum(roomId: number) {
    return await this.redisService.hincrby(this.makeGameKey(roomId), NUM_FIELD);
  }

  async delNum(roomId: number) {
    return await this.redisService.hdel(this.makeGameKey(roomId), NUM_FIELD);
  }

  async setPlayerJob(roomId, Player: Player[]) {
    await this.redisService.hset(
      this.makeGameKey(roomId),
      PLAYERJOB_FIELD,
      Player,
    );
  }

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

  async setPlayerNum(roomId: number) {
    return await this.redisService.hincrby(
      this.makeGameKey(roomId),
      PLAYERNUM_FIELD,
    );
  }

  async setDie(roomId: number, player: Player) {
    const dieUser = (await this.getDie(roomId)) || [];

    dieUser.push(player);

    return await this.redisService.hset(
      this.makeGameKey(roomId),
      EXDIE_FIELD,
      dieUser,
    );
  }
  async getDie(roomId: number) {
    return await this.redisService.hget(this.makeGameKey(roomId), EXDIE_FIELD);
  }

  async setLeave(roomId: number, player: Player) {
    const dieUser = (await this.getLeave(roomId)) || [];
    const leaveusers = (await this.getLeave(roomId)) || [];

    // for (let user = 0; user < dieUser.length; user++) {
    //   if()
    // }

    leaveusers.push(player);

    return this.redisService.hset(
      this.makeGameKey(roomId),
      EXLEAVE_FIELD,
      leaveusers,
    );
  }

  async getLeave(roomId: number) {
    return await this.redisService.hget(
      this.makeGameKey(roomId),
      EXLEAVE_FIELD,
    );
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
  async setMafia(roomId: number, userNum: number) {
    await this.redisService.hset(
      this.makeGameKey(roomId),
      MAFIA_FIELD,
      userNum,
    );
  }

  async getMafia(roomId: number) {
    return await this.redisService.hget(this.makeGameKey(roomId), MAFIA_FIELD);
  }

  async setDoctor(roomId: number, userNum: number) {
    await this.redisService.hset(
      this.makeGameKey(roomId),
      DOCTOR_FIELD,
      userNum,
    );
  }

  async getDoctor(roomId: number) {
    return await this.redisService.hget(this.makeGameKey(roomId), DOCTOR_FIELD);
  }
  async getPunish(roomId: number): Promise<any> {
    return await this.redisService.hget(this.makeGameKey(roomId), PUNISH_FIELD);
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

  async getVote(roomId: number): Promise<number[]> {
    return await this.redisService.hget(this.makeGameKey(roomId), VOTE_FIELD);
  }

  async voteValidation(roomId: number, vote: number) {
    const players = await this.getPlayerJobs(roomId);

    if (!players[vote - 1] || players[vote - 1].die)
      throw new WsException('투표할 수 없는 유저입니다.');

    return vote;
  }
}
