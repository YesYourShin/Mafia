import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { GameRoomInfoWithMemberCount } from '.';
import { GameRoomInfo, GameRoomInfoWithGameMembers } from './game-info';

export class ResponseGameInfoWithGameMembersDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameRoomInfoWithGameMembers })
  data: GameRoomInfoWithGameMembers;
}
export class ResponseGameInfoWithMemberCountDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameRoomInfoWithMemberCount, isArray: true })
  data: GameRoomInfoWithMemberCount[];
}

export class ResponseCurrentGamesInfo {
  @ApiProperty({ type: () => GameRoomInfoWithMemberCount, isArray: true })
  data: GameRoomInfoWithMemberCount[];
}

export class ResponseGamesInfoDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameRoomInfo, isArray: true })
  data: GameRoomInfo[];
}
