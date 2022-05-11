import { Controller, Get } from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { GameRoom, Member } from './modules/game-room/dto';

export class ResponseMemberList {
  @ApiProperty({ type: () => Member, isArray: true })
  members: Member[];
}
export class ResponseSocketJoinEventDto {
  @ApiProperty({ type: () => Member })
  member: Member;
}
class MemberIdAndNickname {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 'audaa' })
  nickname: string;
}
export class ResponseSocketMessageEventDto {
  @ApiProperty({ example: 1 })
  roomId: number;
  @ApiProperty({ type: () => MemberIdAndNickname })
  member: MemberIdAndNickname;
  @ApiProperty({ example: 'Hello' })
  message: string;
}

@ApiTags('Socket')
@Controller('Socket')
export class SocketApiDocumentController {
  constructor() {}

  @ApiOkResponse({
    description: '지금 참가하는 멤버 정보',
    type: ResponseSocketJoinEventDto,
  })
  @ApiOperation({
    summary: '게임 방 참가 이벤트',
  })
  @ApiBody({
    schema: {
      example: { roomId: 1 },
    },
  })
  @ApiForbiddenResponse({
    schema: {
      example: '방의 인원이 초과되었습니다',
    },
  })
  @Get('join')
  join() {}

  @ApiOkResponse({
    description:
      'disconnect 될 때 자동 게임 방 나가기 (나가는 사람이 마지막 사람이면 자동 방 파괴)',
  })
  @ApiOperation({
    summary: '게임 방 나가기 (나가는 사람이 마지막 사람이면 자동 방 파괴)',
  })
  @Get('disconnect')
  leave() {}

  @ApiOkResponse({
    description: '게임 방 수정된 정보',
    type: GameRoom,
  })
  @ApiOperation({
    summary: '게임 방 정보 수정 이벤트',
  })
  @Get('update')
  update() {}

  @ApiOkResponse({
    description: '게임 방 멤버들 정보',
    type: ResponseMemberList,
  })
  @ApiOperation({
    summary: '게임 방 멤버들 정보 최신화',
  })
  @Get('memberlist')
  onlineList() {}

  //Todo : 이벤트 구현
  @ApiOkResponse({
    description: '게임 방 채팅 내용 미구현',
    type: ResponseSocketMessageEventDto,
  })
  @ApiBody({
    schema: {
      example: { message: 'hello' },
    },
  })
  @ApiOperation({
    summary: '게임 방 채팅 이벤트',
  })
  @Get('message')
  message() {}

  @ApiOkResponse({
    description: '게임 시작 이벤트',
    schema: {
      example: { roomId: 1, start: true },
    },
  })
  @ApiOperation({
    summary: '게임 시작 이벤트',
  })
  @Get('start')
  start() {}

  @ApiOkResponse({
    description: '게임 준비 후 MEMBER_LIST 이벤트',
  })
  @ApiOperation({
    summary: '게임 준비 이벤트',
  })
  @Get('ready')
  ready() {}

  @ApiOkResponse({
    description: '게임 준비 해제 후 MEMBER_LIST 이벤트',
  })
  @ApiOperation({
    summary: '게임 준비 해제 이벤트',
  })
  @Get('unready')
  unready() {}
}
