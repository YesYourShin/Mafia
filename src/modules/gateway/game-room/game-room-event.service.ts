import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  GAME_ROOM_INFO,
  GAME_ROOM_NUMBER,
  GAME_ROOM_MEMBERS,
  GameRoomEvent,
  GameRoomInfoFindOptions,
  GAME_ROOM_READY_MEMBERS,
  GAME_SOCKET_NAMESPACE,
} from './constants';
import {
  CreateGameRoomDto,
  UpdateGameRoomDto,
  Member,
  GameRoomInfo,
  GameRoomInfoWithGameMembers,
  GameRoomInfoWithMemberCount,
} from 'src/modules/game-room/dto';
import { removeNilFromObject } from 'src/common/constants';
import { RedisGameService } from 'src/modules/redis/redis-game.service';
import { GameRoomGateway } from './game-room.gateway';
import { promiseAllSetteldResult } from 'src/shared/promise-all-settled-result';

@Injectable()
export class GameRoomEventService {
  constructor(
    private readonly redisGameService: RedisGameService,
    @Inject(forwardRef(() => GameRoomGateway))
    private readonly gameRoomGateway: GameRoomGateway,
    @Inject(Logger)
    private readonly logger = new Logger('GameRoomEventService'),
  ) {}

  async create(
    createGameRoomDto: CreateGameRoomDto,
    member: Member,
  ): Promise<GameRoomInfo> {
    await this.setGameRoomNumber(createGameRoomDto);
    await this.saveGameRoomInfo(createGameRoomDto);

    return await this.findGameRoomInfo({
      gameRoomNumber: createGameRoomDto.gameRoomNumber,
    });
  }

  async update(
    gameRoomNumber: number,
    updateGameRoomDto: UpdateGameRoomDto,
    userId: number,
  ): Promise<void> {
    const members = await this.findAllMemberByGameRoomNumber(gameRoomNumber);
    if (!this.matchASpecificMemberIdWitUserId(members[0].userId, userId))
      throw new ForbiddenException('방 수정할 수 있는 권한이 없습니다');

    await this.saveGameRoomInfo(updateGameRoomDto);

    const gameRoomInfo = await this.findGameRoomInfo({
      gameRoomNumber: updateGameRoomDto.gameRoomNumber,
    });

    this.gameRoomGateway.server
      .to(`${GAME_SOCKET_NAMESPACE}-${gameRoomNumber}`)
      .emit(GameRoomEvent.UPDATE, gameRoomInfo);
  }

  // API join 요청 인원수 제한만 확인 후 응답
  async join(gameRoomNumber: number) {
    const { limit } = await this.findGameRoomInfo({ gameRoomNumber });
    const members = await this.findAllMemberByGameRoomNumber(gameRoomNumber);
    if (limit <= members.length)
      throw new ForbiddenException('방이 꽉 찼습니다');
    return { gameRoomNumber, joinable: true };
  }

  // Socket
  async joinGameRoom(
    gameRoomNumber: number,
    member: Member,
  ): Promise<Member[]> {
    const members = await this.findAllMemberByGameRoomNumber(gameRoomNumber);
    this.addMember(members, member);
    await this.saveMembers(`${GAME_ROOM_MEMBERS}${gameRoomNumber}`, members);

    return members;
  }

  async findMember(gameRoomNumber: number, userId: number): Promise<Member> {
    const members = await this.findAllMemberByGameRoomNumber(gameRoomNumber);
    return this.getMemberInGameRoomMember(members, userId);
  }

  addMember(members: Member[], member: Member) {
    const exMember = this.getMemberInGameRoomMember(members, member.userId);
    if (!exMember) {
      members.push(member);
    }
  }

  // 게임 방 번호로 모든 멤버 찾기
  async findAllMemberByGameRoomNumber(
    gameRoomNumber: number,
  ): Promise<Member[]> {
    return (
      (await this.redisGameService.hget(
        `${GAME_ROOM_MEMBERS}${gameRoomNumber}`,
      )) || []
    );
  }

  async findAllOfGameRoomInfo(): Promise<GameRoomInfoWithMemberCount[]> {
    const fieldsOfGameRoomInfo: string[] = await this.getFieldsOfGameRoomInfo();
    const values = await this.redisGameService.hmget(fieldsOfGameRoomInfo);

    try {
      const result = await promiseAllSetteldResult(
        values.map(async (value) => {
          const room: GameRoomInfoWithMemberCount = JSON.parse(value);
          const members = await this.findAllMemberByGameRoomNumber(
            room.gameRoomNumber,
          );
          room.memberCount = members.length;
          return room;
        }),
      );
      const { value, reason } = result;

      if (reason) {
        this.logger.error('Error when find game room info', reason);
      }

      return value;
    } catch (error) {
      console.error(error);
    }
  }

  async mergeGameRoomInfoAndMembers(
    options: GameRoomInfoFindOptions,
  ): Promise<GameRoomInfoWithGameMembers> {
    const gameRoomInfo: GameRoomInfoWithGameMembers =
      await this.findGameRoomInfo(options);

    gameRoomInfo.members = await this.findAllMemberByGameRoomNumber(
      gameRoomInfo.gameRoomNumber,
    );

    return gameRoomInfo;
  }

  // 방 정보 찾기
  async findGameRoomInfo(
    options: GameRoomInfoFindOptions,
  ): Promise<GameRoomInfo> {
    if (Object.keys(removeNilFromObject(options)).length === 0) return null;

    const { gameRoomNumber, field } = options;

    if (gameRoomNumber) {
      return await this.redisGameService.hget(
        `${GAME_ROOM_INFO}${gameRoomNumber}`,
      );
    }

    if (field) {
      return await this.redisGameService.hget(field);
    }
  }

  async getFieldsOfGameRoomInfo(): Promise<string[]> {
    const fields = await this.redisGameService.hkeys();
    return this.filterOutGameRoomInfoField(fields);
  }

  async leave(gameRoomNumber: number, userId: number) {
    const members = await this.findAllMemberByGameRoomNumber(gameRoomNumber);
    if (
      this.isLastMember(members) &&
      this.matchASpecificMemberIdWitUserId(members[0].userId, userId)
    )
      return await this.remove(gameRoomNumber);

    const newMembers = members.filter((member) => member.userId !== userId);
    await this.saveMembers(`${GAME_ROOM_MEMBERS}${gameRoomNumber}`, newMembers);
    await this.gameUnReady(gameRoomNumber, userId);

    return { gameRoomNumber, userId, leave: true };
  }

  async remove(gameRoomNumber: number) {
    await this.redisGameService.hdel(gameRoomNumber);
    return { gameRoomNumber, delete: true };
  }

  async getDailyGameRoomNumber(): Promise<number> {
    return await this.redisGameService.hincrby(GAME_ROOM_NUMBER, 1);
  }

  async saveMembers(field: string, members: Member[]): Promise<any> {
    return await this.redisGameService.hset(field, members);
  }

  // 게임 정보 저장
  async saveGameRoomInfo(
    gameDto: CreateGameRoomDto | UpdateGameRoomDto,
  ): Promise<any> {
    return await this.redisGameService.hset(
      `${GAME_ROOM_INFO}${gameDto.gameRoomNumber}`,
      gameDto,
    );
  }

  // 방번호 생성 후 dto에 넣어줌
  async setGameRoomNumber(gameDto: CreateGameRoomDto) {
    const gameRoomNumber = await this.getDailyGameRoomNumber();
    gameDto.gameRoomNumber = gameRoomNumber;
  }

  async gameReady(gameRoomNumber: number, memberId: number) {
    const members = new Set(await this.getGameReadyMember(gameRoomNumber));
    members.add(memberId);
    await this.setGameReadyMember(gameRoomNumber, [...members]);
  }

  async gameUnReady(gameRoomNumber: number, memberId: number) {
    const members = new Set(await this.getGameReadyMember(gameRoomNumber));
    members.delete(memberId);
    await this.setGameReadyMember(gameRoomNumber, [...members]);
  }

  async setGameReadyMember(gameRoomNumber: number, members: number[]) {
    return await this.redisGameService.hset(
      `${GAME_ROOM_READY_MEMBERS}${gameRoomNumber}`,
      members,
    );
  }

  async getGameReadyMember(gameRoomNumber: number): Promise<number[]> {
    return (
      (await this.redisGameService.hget(
        `${GAME_ROOM_READY_MEMBERS}${gameRoomNumber}`,
      )) || []
    );
  }

  async isReadyForTheGame(gameRoomNumber: number, member: Member) {
    const members: Member[] = await this.redisGameService.hget(
      `${GAME_ROOM_READY_MEMBERS}${gameRoomNumber}`,
    );
    const a = this.getMemberInGameRoomMember(members, member.userId);
    if (!a) {
      throw new ForbiddenException('방 멤버가 아닙니다');
    }
  }

  async startGame(gameRoomNumber: number, member: Member) {
    const members: Member[] = await this.redisGameService.hget(
      `${GAME_ROOM_READY_MEMBERS}${gameRoomNumber}`,
    );
    if (!this.matchASpecificMemberIdWitUserId(members[0].userId, member.userId))
      throw new ForbiddenException('게임을 시작할 수 있는 권한이 없습니다');
  }

  isLastMember(members: Member[]): boolean {
    return members.length === 1;
  }

  getMemberInGameRoomMember(members: Member[], userId: number): Member {
    for (const member of members) {
      const isMember = this.matchASpecificMemberIdWitUserId(
        member.userId,
        userId,
      );
      if (isMember) {
        return member;
      }
    }
  }

  // 특정 맴버 id와 user id 매치
  matchASpecificMemberIdWitUserId(memberId: number, userId: number) {
    return memberId === userId;
  }

  filterOutGameRoomInfoField(fields: string[]): string[] {
    return fields.filter((field) => field.match(/INFO.+/));
  }
}
