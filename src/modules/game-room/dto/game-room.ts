import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { GameMode } from 'src/common/constants';

export class GameRoom {
  @Exclude() private readonly _id: number;
  @Exclude() private readonly _mode: GameMode;
  @Exclude() private readonly _room: number;
  @Exclude() private readonly _description: string;
  @Exclude() private readonly _pin: string | null;
  @Exclude() private readonly _publishers: number;

  constructor(
    id: number,
    mode: GameMode,
    room: number,
    description: string,
    publishers: number,
    pin: string | null,
  ) {
    this._id = id;
    this._mode = mode;
    this._room = room;
    this._description = description;
    this._publishers = publishers;
    this._pin = pin;
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
    example: '1234',
    description: '방 비밀번호',
    required: false,
  })
  @Expose()
  get pin(): string | null {
    return this._pin;
  }
}
