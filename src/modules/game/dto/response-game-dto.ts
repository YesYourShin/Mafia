import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { GameInfoWithMemberCount } from '.';
import { GameInfo, GameInfoWithGameMembers } from './game-info';

export class ResponseGameInfoWithGameMembersDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameInfoWithGameMembers })
  data: GameInfoWithGameMembers;
}
export class ResponseGameInfoWithMemberCountDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameInfoWithMemberCount, isArray: true })
  data: GameInfoWithMemberCount[];
}

export class ResponseCurrentGamesInfo {
  @ApiProperty({ type: () => GameInfoWithMemberCount, isArray: true })
  data: GameInfoWithMemberCount[];
}

export class ResponseGamesInfoDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameInfo, isArray: true })
  data: GameInfo[];
}
