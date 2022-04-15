import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { GameMode } from 'src/common/constants';

export class CreateGameRoomDto {
  @ApiProperty({
    example: 'classic',
    description: '게임 모드 classic',
  })
  @IsNotEmpty()
  @IsEnum(GameMode)
  mode: GameMode;

  @ApiProperty({
    example: '초보만 ㄱ',
    description: '방 이름',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 8,
    description: '방 인원제한 6 - 10',
  })
  @IsNotEmpty()
  @IsInt()
  publishers: number;

  @ApiProperty({
    example: '1234',
    description: '방 비밀번호',
    required: false,
  })
  @IsOptional()
  @IsString()
  pin?: string;

  constructor() {}

  static of(
    mode: GameMode,
    description: string,
    publishers: number,
    pin?: string,
  ): CreateGameRoomDto {
    const createGameRoomDto = new CreateGameRoomDto();
    createGameRoomDto.mode = mode;
    createGameRoomDto.description = description;
    createGameRoomDto.publishers = publishers;
    if (pin) {
      createGameRoomDto.pin = pin;
    }
    return createGameRoomDto;
  }
}
