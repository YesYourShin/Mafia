import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { GameInfo, GameInfoWithGameMembers } from './game-info';

export class ResponseGameInfoWithGameMembersDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameInfoWithGameMembers })
  data: GameInfoWithGameMembers;
}

export class ResponseGamesInfoDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameInfo, isArray: true })
  data: GameInfo[];
}
