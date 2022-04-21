import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { GameMode } from 'src/common/constants';
import { GameRoom } from './game-room';

export class GameRoomWithMemberCount {
  @Exclude() private readonly _id: number;
  @Exclude() private readonly _mode: GameMode;
  @Exclude() private readonly _room: number;
  @Exclude() private readonly _description: string;
  @Exclude() private readonly _publishers: number;
  @Exclude() private readonly _isPrivate: boolean;
  @Exclude() private readonly _memberCount: number;
  @Exclude() private readonly _leader: string;

  constructor(gameRoom: GameRoom, memberCount: number, leader: string) {
    const { id, description, mode, pin, publishers, room } = gameRoom;
    this._id = id;
    this._mode = mode;
    this._room = room;
    this._description = description;
    this._publishers = publishers;
    this._isPrivate = pin ? true : false;
    this._memberCount = memberCount;
    this._leader = leader;
  }

  @ApiProperty({
    example: 1,
    description: '시각적으로 보여줄 게임 방 번호',
  })
  @Expose()
  get id(): number {
    return this._id;
  }

  @ApiProperty({
    example: 'classic',
    description: '게임 모드 classic',
  })
  @Expose()
  get mode(): GameMode {
    return this._mode;
  }

  @ApiProperty({
    example: 823418897128478,
    description: 'Janus room 고유 번호',
  })
  @Expose()
  get room(): number {
    return this._room;
  }

  @ApiProperty({
    example: '초보만 ㄱ',
    description: '방 이름',
  })
  @Expose()
  get description(): string {
    return this._description;
  }

  @ApiProperty({
    example: 8,
    description: '방 인원제한 6 - 10',
  })
  @Expose()
  get publishers(): number {
    return this._publishers;
  }

  @ApiProperty({
    description: '비밀번호가 있는 가',
    example: false,
  })
  @Expose()
  get isPrivate(): boolean {
    return this._isPrivate;
  }
  @ApiProperty({
    description: '유저 현재 인원 수',
    example: 1,
  })
  @Expose()
  get memberCount(): number {
    return this._memberCount;
  }

  @ApiProperty({
    description: '방장 닉네임',
    example: 'gjgjajaj',
  })
  @Expose()
  get leader(): string {
    return this._leader;
  }
}
