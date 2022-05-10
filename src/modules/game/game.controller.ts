import { Controller, Get, Query } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get()
  async findAll(
    @Query('nickname') nickname: string,
    @Query('page') page: number,
    @Query('item') item: number,
  ) {
    return await this.gameService.findAll(nickname, page, item);
  }

  // @Get()
  // async hi() {
  //   return 'hi';
  // }

  // async findOne(id: number) {
  //   return await this.gameService.findOne(id);
  // }
}
