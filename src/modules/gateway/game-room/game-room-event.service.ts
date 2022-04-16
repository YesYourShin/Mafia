import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  GameRoomEvent,
  GAME_ROOM,
  GAME_SOCKET_NAMESPACE,
  INFO_FIELD,
  MEMBER_FIELD,
} from './constants';
import {
  UpdateGameRoomDto,
  Member,
  GameRoomWithMemberCount,
  GameRoomWithMembers,
  CreateGameRoomDto,
} from 'src/modules/game-room/dto';
import { RedisService } from 'src/modules/redis/redis.service';
import { GameRoomGateway } from './game-room.gateway';
import { promiseAllSetteldResult } from 'src/shared/promise-all-settled-result';
import { JanusService } from 'src/modules/janus/janus.service';
import { ConfigService } from '@nestjs/config';
import { GameRoom } from 'src/modules/game-room/dto/game-room';
import { instanceToPlain } from 'class-transformer';
import { WsException } from '@nestjs/websockets';
import { ProfileInfo, UserProfile } from 'src/modules/user/dto';

@Injectable()
export class GameRoomEventService {
  constructor(
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => GameRoomGateway))
    private readonly gameRoomGateway: GameRoomGateway,
    @Inject(Logger)
    private readonly logger = new Logger('GameRoomEventService'),
    private readonly janusService: JanusService,
    private readonly configService: ConfigService,
  ) {}

  async getJanusRoomList() {
    return await this.janusService.getJanusRoomList();
  }
  // 방 생성
  async create(
    createGameRoomDto: CreateGameRoomDto,
    user: UserProfile,
  ): Promise<GameRoom> {
    const { mode, description, publishers, pin } = createGameRoomDto;
    const id = await this.getDailyGameRoomNumber();

    const janusRoom = await this.janusService.createJanusRoom(
      createGameRoomDto,
    );

    const gameRoom = pin
      ? new GameRoom(
          id,
          mode,
          janusRoom.response.room,
          description,
          publishers,
          pin,
        )
      : new GameRoom(
          id,
          mode,
          janusRoom.response.room,
          description,
          publishers,
        );

    await this.saveGameRoomInfo(gameRoom);
    const member = new Member(user.profile);
    const members = [member];
    await this.saveMembers(this.makeRoomKey(id), MEMBER_FIELD, members);

    return gameRoom;
  }
  // 방 업데이트
  async update(
    gameRoomNumber: number,
    updateGameRoomDto: UpdateGameRoomDto,
    userId: number,
  ): Promise<void> {
    const { id, mode, description, pin, publishers, room } = updateGameRoomDto;
    const members = await this.findMembersByRoomId(gameRoomNumber);

    if (!this.matchSpecificMember(members[0].userId, userId))
      throw new ForbiddenException('방 수정할 수 있는 권한이 없습니다');

    const gameRoom = new GameRoom(id, mode, room, description, publishers, pin);

    await this.saveGameRoomInfo(gameRoom);

    this.gameRoomGateway.server
      .to(`${GAME_SOCKET_NAMESPACE}-${gameRoomNumber}`)
      .emit(GameRoomEvent.UPDATE, gameRoom);
  }

  // API join 요청 인원수 제한만 확인 후 응답
  async joinable(roomId: number): Promise<object> {
    const { publishers } = await this.findOneOfRoomInfo(roomId);
    const members = await this.findMembersByRoomId(roomId);
    if (publishers <= members.length)
      throw new ForbiddenException('방이 꽉 찼습니다');
    return { roomId, joinable: true };
  }

  // Socket
  async join(roomId: number, member: Member): Promise<Member[]> {
    const members = await this.findMembersByRoomId(roomId);
    this.addMember(members, member);
    await this.saveMembers(this.makeRoomKey(roomId), MEMBER_FIELD, members);

    return members;
  }

  // roomId를 이용하여 방안에 있는 특정 멤버 찾기
  async findMember(roomId: number, memberId: number): Promise<Member> {
    const members = await this.findMembersByRoomId(roomId);
    return this.getMemberInGameRoomMember(members, memberId);
  }

  // 멤버 중복 체크 후 존재하지 않는 멤버라면 추가
  addMember(members: Member[], member: Member) {
    const exMember = this.getMemberInGameRoomMember(members, member.userId);
    if (!exMember) {
      members.push(member);
    }
  }

  // 게임 방 번호로 모든 멤버 찾기
  async findMembersByRoomId(roomId: number): Promise<Member[]> {
    const members =
      (await this.redisService.hget(this.makeRoomKey(roomId), MEMBER_FIELD)) ||
      [];

    return members;
  }

  async findGameRoomWithMemberCount(): Promise<GameRoomWithMemberCount[]> {
    const roomKeys: string[] = await this.getRoomKeys();

    const result = await promiseAllSetteldResult(
      roomKeys.map(async (key) => {
        const room: GameRoom = await this.redisService.hget(key, INFO_FIELD);
        const members = await this.findMembersByRoomId(room.id);
        const gameRoom = new GameRoomWithMemberCount(room, members.length);
        return gameRoom;
      }),
    );
    const { value, reason } = result;

    if (reason?.length) {
      this.logger.error('Error when find game room info', reason);
    }

    return value;
  }

  async mergeGameRoomInfoAndMembers(
    roomId: number,
  ): Promise<GameRoomWithMembers> {
    const roomInfo = await this.findOneOfRoomInfo(roomId);
    if (!roomInfo) {
      throw new NotFoundException('존재하지 않는 게임 방입니다');
    }
    const members = await this.findMembersByRoomId(roomId);

    return new GameRoomWithMembers(roomInfo, members);
  }

  // 방 정보 찾기
  async findOneOfRoomInfo(roomId: number): Promise<GameRoom> {
    return await this.redisService.hget(this.makeRoomKey(roomId), INFO_FIELD);
  }

  async getRoomKeys(): Promise<string[]> {
    return await this.redisService.keys(`${GAME_ROOM}*`);
  }

  // 방 나가기
  async leave(roomId: number, memberId: number): Promise<Member[] | object> {
    const members = await this.findMembersByRoomId(roomId);
    if (
      this.isLastMember(members) &&
      this.matchSpecificMember(members[0].userId, memberId)
    ) {
      return await this.remove(roomId);
    }

    const newMembers = members.filter((member) => member.userId !== memberId);
    await this.saveMembers(this.makeRoomKey(roomId), MEMBER_FIELD, newMembers);

    return newMembers;
  }
  // 방 삭제
  async remove(roomId: number): Promise<object> {
    await this.redisService.del(this.makeRoomKey(roomId));
    try {
      await this.janusService.destroyJanusRoom(roomId);
    } catch (error) {
      this.logger.error('Error when destroy janus room', error);
    }
    return { roomId, delete: true };
  }

  async getDailyGameRoomNumber(): Promise<number> {
    return await this.redisService.incr();
    // return await this.redisService.bitpos(ROOM_NUMBER, 1);
  }

  async saveMembers(
    key: string,
    field: string,
    members: Member[],
  ): Promise<any> {
    return await this.redisService.hset(key, field, members);
  }

  // 게임 정보 저장
  async saveGameRoomInfo(gameRoom: GameRoom): Promise<any> {
    return await this.redisService.hset(
      this.makeRoomKey(gameRoom.id),
      INFO_FIELD,
      instanceToPlain(gameRoom),
    );
  }

  async setReady(roomId: number, memberId: number): Promise<Member[]> {
    const members = await this.findMembersByRoomId(roomId);
    for (const member of members) {
      if (member.userId === memberId) {
        member.ready = true;
      }
    }
    await this.saveMembers(this.makeRoomKey(roomId), MEMBER_FIELD, members);
    return members;
  }

  async setUnReady(roomId: number, memberId: number): Promise<Member[]> {
    const members = await this.findMembersByRoomId(roomId);
    for (const member of members) {
      if (member.userId === memberId) {
        member.ready = false;
      }
    }
    await this.saveMembers(this.makeRoomKey(roomId), MEMBER_FIELD, members);
    return members;
  }

  //Todo 미구현
  async startGame(roomId: number, memberId: number) {
    const members = await this.findMembersByRoomId(roomId);
    if (!this.matchSpecificMember(members[0].userId, memberId)) {
      throw new ForbiddenException('게임을 시작할 수 있는 권한이 없습니다');
    }
    for (const member of members) {
      if (!member.ready) {
        throw new WsException(
          '모든 유저가 준비를 해야 게임을 시작할 수 있습니다',
        );
      }
    }
  }

  isLastMember(members: Member[]): boolean {
    return members.length === 1;
  }

  // 멤버 배열에서 특정 멤버 찾기
  getMemberInGameRoomMember(members: Member[], userId: number): Member {
    for (const member of members) {
      const isMember = this.matchSpecificMember(member.userId, userId);
      if (isMember) {
        return member;
      }
    }
  }

  // 특정 맴버 id와 user id 매치
  matchSpecificMember(memberId: number, userId: number): boolean {
    return memberId === userId;
  }

  makeRoomKey(roomId: number): string {
    return `${GAME_ROOM}:${roomId}`;
  }
  async getJanusRoomListParticipants(roomId: number): Promise<any> {
    return await this.janusService.getJanusRoomListParticipants(roomId);
  }

  async removeJanusRoom(roomId: number): Promise<any> {
    return await this.janusService.destroyJanusRoom(roomId);
  }
}
