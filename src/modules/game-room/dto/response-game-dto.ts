import { ApiProperty, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { GameRoomWithMemberCount } from './game-room-with-member-count';
import { GameRoomWithMembers } from './game-room-with-members';

export class ResponseGameRoomFindAllDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameRoomWithMemberCount, isArray: true })
  data: GameRoomWithMemberCount;
}

export class ResponseGameRoomFindOneDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameRoomWithMembers, isArray: true })
  data: GameRoomWithMembers;
}

export class ResponseGameRoomDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameRoomWithMembers, isArray: true })
  data: GameRoomWithMembers;
}

export class ResponseEntityDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => GameRoomWithMembers, isArray: true })
  data: GameRoomWithMembers;
}
