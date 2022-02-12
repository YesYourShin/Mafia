import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Games')
@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({ summary: '방 생성' })
  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @ApiOperation({ summary: '방 불러오기' })
  @Get()
  findAll() {
    return this.gameService.findAll();
  }

  @ApiOperation({ summary: '특정 방 불러오기' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gameService.findOne(+id);
  }

  @ApiOperation({ summary: '방 수정' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gameService.update(+id, updateGameDto);
  }

  @ApiOperation({ summary: '방 삭제' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gameService.remove(+id);
  }
}
