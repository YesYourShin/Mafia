import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  Get,
  Sse,
  MessageEvent,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { CreateGameRoomDto } from './dto/create-game-room.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoggedInGuard } from '../auth/guards/logged-in.guard';
import { UserDecorator } from 'src/decorators/user.decorator';
import { UserProfile } from '../user/dto';
import {
  GameRoom,
  GameRoomWithMembers,
  ResponseGameRoomFindAllDto,
  ResponseGameRoomFindOneDto,
  UpdateGameRoomDto,
} from './dto';
import { ResponseDto } from 'src/common/dto';
import {
  ExistGameRoomGuard,
  GameMemberGuard,
  ValidateLimitGuard,
} from './guards';
import { concatMap, from, interval, map, Observable } from 'rxjs';
import { IsGameRoomMemberGuard } from './guards/is-game-room-member.guard';
import { GameRoomEventService } from '../gateway/game-room/game-room-event.service';
import { GameRoomWithMemberCount } from './dto/game-room-with-member-count';
import { ExistedProfileGuard } from 'src/common/guards';

@ApiCookieAuth('connect.sid')
@UseGuards(LoggedInGuard, ExistedProfileGuard)
@ApiTags('Rooms')
@Controller('games/rooms')
export class GameRoomController {
  constructor(private readonly gameRoomEventService: GameRoomEventService) {}

  @ApiResponse({
    description: '5초마다 게임 방 정보 최신화해서 보내 줌',
    type: ResponseGameRoomFindAllDto,
  })
  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return interval(5000)
      .pipe(
        concatMap(() =>
          from(this.gameRoomEventService.findGameRoomWithMemberCount()),
        ),
      )
      .pipe(map((response) => ({ data: response })));
  }

  @ApiOkResponse({
    description: '전체 게임 방 불러오기 성공',
    type: ResponseGameRoomFindAllDto,
  })
  @ApiOperation({ summary: '전체 게임 방 불러오기' })
  @Get()
  async findAll(): Promise<GameRoomWithMemberCount[]> {
    return await this.gameRoomEventService.findGameRoomWithMemberCount();
  }

  @ApiOkResponse({
    description: '게임 방 정보와 멤버 정보 불러오기 성공',
    type: ResponseGameRoomFindOneDto,
  })
  @ApiParam({
    name: 'roomId',
    description: '게임 방 번호',
    example: 1,
  })
  @ApiOperation({ summary: '특정 게임 방 정보 불러오기 ' })
  @Get(':roomId')
  async findUsersInGameRoomWithRoomInfo(
    @Param('roomId') roomId: string,
  ): Promise<GameRoomWithMembers> {
    return await this.gameRoomEventService.mergeGameRoomInfoAndMembers(+roomId);
  }

  @ApiCreatedResponse({
    description: '게임 방 생성 성공',
    type: GameRoom,
  })
  @ApiBadRequestResponse({
    description: '최대 인원 수 설정 실패',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.BAD_REQUEST,
        '잘못된 게임 최대 인원 수 설정',
      ),
    },
  })
  @ApiBody({
    description: '방 생성 시 필요한 정보',
    type: CreateGameRoomDto,
  })
  @ApiOperation({ summary: '게임 방 생성' })
  @UseGuards(ValidateLimitGuard)
  @Post()
  async create(
    @Body() createGameRoomDto: CreateGameRoomDto,
  ): Promise<GameRoom> {
    return await this.gameRoomEventService.create(createGameRoomDto);
  }

  @ApiOperation({ summary: 'janus 요청 신경 x' })
  @Post('list')
  async getRoomList() {
    return await this.gameRoomEventService.getJanusRoomList();
  }

  @ApiOperation({ summary: 'janus 요청 신경 x' })
  @Post('list-participants/:room')
  async getListParticipants(@Param('room') room: string) {
    return await this.gameRoomEventService.getJanusRoomListParticipants(+room);
  }

  @ApiOkResponse({
    description: '게임 방 참가 가능',
    schema: {
      example: new ResponseDto(true, 200, { roomId: 1, joinable: true }),
    },
  })
  @ApiForbiddenResponse({
    description: '게임 방 참가 권한 불가',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.FORBIDDEN,
        '게임 참여할 권한이 없습니다',
      ),
    },
  })
  @ApiParam({
    name: 'roomId',
    description: '게임 방 번호',
    example: 1,
  })
  @ApiOperation({ summary: '게임 방 참가 가능 여부' })
  @UseGuards(ExistGameRoomGuard, IsGameRoomMemberGuard)
  @Get(':roomId/joinable-room')
  async joinable(@Param('roomId') roomId: string): Promise<object> {
    return await this.gameRoomEventService.joinable(+roomId);
  }

  @ApiCreatedResponse({
    description: '게임 방 정보 업데이트 성공 후 Socket Event Update Emit',
  })
  @ApiBadRequestResponse({
    description: '최대 인원 수 설정 실패',
    schema: {
      example: new ResponseDto(
        false,
        HttpStatus.BAD_REQUEST,
        '잘못된 게임 최대 인원 수 설정',
      ),
    },
  })
  @ApiBody({
    description: '방 생성 시 필요한 정보',
    type: CreateGameRoomDto,
  })
  @ApiOperation({ summary: '게임 방 정보 업데이트' })
  @UseGuards(ValidateLimitGuard)
  @Patch(':roomId')
  async update(
    @Body() updateGameDto: UpdateGameRoomDto,
    @UserDecorator() user: UserProfile,
    @Param('roomId') roomId: string,
  ): Promise<void> {
    return await this.gameRoomEventService.update(
      +roomId,
      updateGameDto,
      user.id,
    );
  }

  @ApiOkResponse({
    description: '게임 방 삭제 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.OK, {
        roomId: 1,
        delete: true,
      }),
    },
  })
  @ApiParam({
    name: 'roomId',
    description: '게임 방 번호',
    example: 1,
  })
  @ApiOperation({ summary: '게임 방 삭제 (게임 끝났을 경우 이 경로)' })
  @UseGuards(ExistGameRoomGuard, GameMemberGuard)
  @Delete(':roomId')
  async removeGame(@Param('roomId') roomId: string): Promise<object> {
    return await this.gameRoomEventService.remove(+roomId);
  }

  @ApiOperation({ summary: 'janus 요청 신경 x' })
  @Delete('janus/:roomId')
  async removeJanusRoom(@Param('roomId') roomId: string) {
    return await this.gameRoomEventService.removeJanusRoom(+roomId);
  }
}
