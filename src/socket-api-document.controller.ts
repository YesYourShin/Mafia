import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameRoom, Member } from './modules/game-room/dto';

@ApiTags('Socket')
@Controller('Socket')
export class SocketApiDocumentController {
  constructor() {}

  @ApiOkResponse({
    description: '지금 참가하는 멤버 정보',
    type: Member,
  })
  @ApiOperation({
    summary: '게임 방 참가 이벤트',
  })
  @Get('join')
  join() {}

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
    type: Member,
    isArray: true,
  })
  @ApiOperation({
    summary: '게임 방 멤버들 정보 최신화',
  })
  @Get('onlinelist')
  onlineList() {}

  //Todo : 이벤트 구현
  @ApiOkResponse({
    description: '게임 방 채팅 내용 미구현',
  })
  @ApiOperation({
    summary: '게임 방 채팅 이벤트',
  })
  @Get('message')
  message() {}

  @ApiOkResponse({
    description: '게임 시작 알림',
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
    description: '게임 준비 알림',
    schema: {
      example: { roomId: 1, ready: true },
    },
  })
  @ApiOperation({
    summary: '게임 준비 이벤트',
  })
  @Get('ready')
  ready() {}

  @ApiOkResponse({
    description: '게임 준비 해제 알림',
    schema: {
      example: { roomId: 1, ready: false },
    },
  })
  @ApiOperation({
    summary: '게임 준비 해제 이벤트',
  })
  @Get('unready')
  unready() {}
}
