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
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { LoggedInGuard } from '../auth/guards/logged-in.guard';
import { UserDecorator } from 'src/decorators/user.decorator';
import { UserProfile } from '../user/dto';
import {
  GameInfo,
  GameInfoWithGameMembers,
  ResponseGameInfoWithGameMembersDto,
  ResponseGamesInfoDto,
} from './dto';
import { ResponseDto } from 'src/common/dto';
import {
  ExistGameRoomGuard,
  GameMemberGuard,
  ValidateLimitGuard,
} from './guards';

@ApiCookieAuth('connect.sid')
@UseGuards(LoggedInGuard)
@ApiTags('Games')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOkResponse({
    description: '전체 게임 방 불러오기 성공',
    type: ResponseGamesInfoDto,
  })
  @ApiOperation({ summary: '전체 게임 방 불러오기' })
  @Get()
  async findAll(): Promise<GameInfo[]> {
    return await this.gameService.findAll();
  }

  // @Sse('sse')
  // sse(): Observable<MessageEvent> {
  // data: this.gameService.findAll(),
  // return interval(5000).pipe(take(this.gameService.findAll()));
  // }

  @ApiOkResponse({
    description: '게임 방 정보와 멤버 정보 불러오기 성공',
    type: ResponseGameInfoWithGameMembersDto,
  })
  @ApiParam({
    name: 'gameNumber',
    description: '게임 방 번호',
    example: 1,
  })
  @ApiOperation({ summary: '특정 게임 방 정보 불러오기 ' })
  @Get(':gameNumber')
  async findUsersInGameRoomWithRoomInfo(
    @Param('gameNumber') gameNumber: string,
  ): Promise<GameInfoWithGameMembers> {
    return await this.gameService.mergeGameInfoAndMembers(+gameNumber);
  }

  @ApiCreatedResponse({
    description: '게임 방 생성 성공',
    type: ResponseGameInfoWithGameMembersDto,
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
    type: CreateGameDto,
  })
  @ApiOperation({ summary: '게임 방 생성' })
  @UseGuards(ValidateLimitGuard)
  @Post()
  async create(
    @Body() createGameDto: CreateGameDto,
    @UserDecorator() user: UserProfile,
  ): Promise<GameInfoWithGameMembers> {
    const { id, nickname, image, level, userId } = user.profile;
    return await this.gameService.create(createGameDto, {
      id,
      nickname,
      image,
      level,
      userId,
    });
  }

  @ApiCreatedResponse({
    description: '게임 방 참가 성공',
    type: ResponseGameInfoWithGameMembersDto,
  })
  @ApiParam({
    name: 'gameNumber',
    description: '게임 방 번호',
    example: 1,
  })
  @ApiOperation({ summary: '게임 방 참가' })
  @UseGuards(ExistGameRoomGuard)
  @Post(':gameNumber')
  async join(
    @Param('gameNumber') gameNumber: string,
    @UserDecorator() user: UserProfile,
  ): Promise<GameInfoWithGameMembers> {
    const { id, nickname, image, level, userId } = user.profile;
    return await this.gameService.join(+gameNumber, {
      id,
      nickname,
      image,
      level,
      userId,
    });
  }

  @ApiOkResponse({
    description: '게임 방 나가기 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.OK, {
        gameNumber: 1,
        exit: true,
      }),
    },
  })
  @ApiParam({
    name: 'gameNumber',
    description: '게임 방 번호',
    example: 1,
  })
  @ApiOperation({
    summary: '게임 방 나가기 (나가는 사람이 마지막 사람이면 자동 방 파괴',
  })
  @UseGuards(ExistGameRoomGuard, GameMemberGuard)
  @Delete(':gameNumber/users/me')
  async leaveGameRoom(
    @Param('gameNumber') gameNumber: string,
    @UserDecorator() user: UserProfile,
  ): Promise<object> {
    const { id, nickname, image, level, userId } = user.profile;
    return this.gameService.leaveInGameRoom(+gameNumber, {
      id,
      nickname,
      image,
      level,
      userId,
    });
  }

  @ApiOkResponse({
    description: '게임 방 삭제 성공',
    schema: {
      example: new ResponseDto(true, HttpStatus.OK, {
        gameNumber: 1,
        delete: true,
      }),
    },
  })
  @ApiParam({
    name: 'gameNumber',
    description: '게임 방 번호',
    example: 1,
  })
  @ApiOperation({ summary: '게임 방 삭제 (게임 끝났을 경우 이 경로)' })
  @UseGuards(ExistGameRoomGuard, GameMemberGuard)
  @Delete(':gameNumber')
  async removeGame(@Param('gameNumber') gameNumber: string): Promise<object> {
    return await this.gameService.removeGameRoom(+gameNumber);
  }
}
