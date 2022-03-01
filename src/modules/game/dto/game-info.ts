import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Game } from 'src/entities/Game';
import { UserProfileInGame } from '.';

export class GameInfoWithMemberCount extends PickType(Game, [
  'mode',
  'name',
  'password',
  'limit',
]) {
  @ApiProperty({
    description: '일일 방 번호',
    example: 1,
  })
  gameNumber: number;
  @ApiProperty({
    description: '유저 현재 인원 수',
    example: 1,
  })
  memberCount?: number;
}
export class GameInfo extends OmitType(GameInfoWithMemberCount, [
  'memberCount',
]) {}

export class GameInfoWithGameMembers extends PickType(GameInfo, [
  'mode',
  'name',
  'password',
  'limit',
  'gameNumber',
]) {
  @ApiProperty({ type: () => UserProfileInGame, isArray: true })
  members?: UserProfileInGame[];
}
