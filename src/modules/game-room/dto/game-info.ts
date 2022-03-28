import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Game } from 'src/entities';
import { Member } from '.';

export class GameRoomInfoWithMemberCount extends PickType(Game, [
  'mode',
  'name',
  'password',
  'limit',
]) {
  @ApiProperty({
    description: '일일 방 번호',
    example: 1,
  })
  gameRoomNumber: number;
  @ApiProperty({
    description: '유저 현재 인원 수',
    example: 1,
  })
  memberCount?: number;
}
export class GameRoomInfo extends OmitType(GameRoomInfoWithMemberCount, [
  'memberCount',
]) {}

export class GameRoomInfoWithGameMembers extends PickType(GameRoomInfo, [
  'mode',
  'name',
  'password',
  'limit',
  'gameRoomNumber',
]) {
  @ApiProperty({ type: () => Member, isArray: true })
  members?: Member[];
}
