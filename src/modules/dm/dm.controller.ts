import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserDecorator } from 'src/decorators';
import { LoggedInGuard } from '../auth/guards';
import { UserProfile } from '../user/dto';
import { DMService } from './dm.service';

@UseGuards(LoggedInGuard)
@Controller('dms/friends')
export class DMController {
  constructor(private readonly dmService: DMService) {}

  @ApiParam({
    name: 'friendId',
    description: 'Friend id',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    required: true,
    example: '?page=1',
    description: '불러올 페이지',
  })
  @ApiQuery({
    name: 'perPage',
    required: true,
    example: '?perPage=30',
    description: 'dm 불러올 개수',
  })
  @ApiOperation({ summary: '특정 친구와의 DM 불러오기' })
  @Get(':friendId')
  async findAll(
    @Query('perPage') perPage: number,
    @Query('page') page: number,
    @Param('friendId') friendId: number,
    @UserDecorator() user: UserProfile,
  ) {
    return await this.dmService.findAll(user.id, friendId, page, perPage);
  }

  @ApiBody({
    schema: { example: { message: '안녕' } },
  })
  @ApiParam({
    name: 'friendId',
    description: 'Friend id',
    required: true,
  })
  @ApiOperation({ summary: 'DM 생성' })
  @Post(':friendId')
  async create(
    @Body() body: any,
    @Param('friendId') friendId: number,
    @UserDecorator() user: UserProfile,
  ) {
    return await this.dmService.create(user.id, friendId, body);
  }
}
