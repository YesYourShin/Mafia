import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserDecorator } from 'src/decorators';
import { LoggedInGuard } from '../auth/guards';
import { UserProfile } from '../user/dto';
import { DMService } from './dm.service';
import { CreateDMDto } from './dto/create-dm-dto';
import { ExistFriendGuard } from './guards/exist-friend.guard';

@UseGuards(LoggedInGuard)
@Controller('dms/friends')
export class DMController {
  constructor(private readonly dmService: DMService) {}

  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        status: 200,
        data: {
          items: [
            {
              id: 16,
              message: 'hi',
              createdAt: '2022-05-06T05:48:25.567Z',
              sender: {
                id: 1,
                nickname: 'bbbbb',
                image: null,
              },
              receiver: {
                id: 2,
                nickname: 'aaa',
                image: null,
              },
            },
            {
              id: 15,
              message: 'hi',
              createdAt: '2022-05-06T05:47:52.730Z',
              sender: {
                id: 1,
                nickname: 'bbbbb',
                image: null,
              },
              receiver: {
                id: 2,
                nickname: 'aaa',
                image: null,
              },
            },
            {
              id: 14,
              message: 'hi',
              createdAt: '2022-05-06T05:47:33.914Z',
              sender: {
                id: 1,
                nickname: 'bbbbb',
                image: null,
              },
              receiver: {
                id: 2,
                nickname: 'aaa',
                image: null,
              },
            },
            {
              id: 13,
              message: 'hi',
              createdAt: '2022-05-06T05:46:28.399Z',
              sender: {
                id: 1,
                nickname: 'bbbbb',
                image: null,
              },
              receiver: {
                id: 2,
                nickname: 'aaa',
                image: null,
              },
            },
            {
              id: 12,
              message: 'hi',
              createdAt: '2022-05-06T05:46:15.338Z',
              sender: {
                id: 1,
                nickname: 'bbbbb',
                image: null,
              },
              receiver: {
                id: 2,
                nickname: 'aaa',
                image: null,
              },
            },
            {
              id: 11,
              message: 'hi',
              createdAt: '2022-05-06T05:45:46.408Z',
              sender: {
                id: 1,
                nickname: 'bbbbb',
                image: null,
              },
              receiver: {
                id: 2,
                nickname: 'aaa',
                image: null,
              },
            },
            {
              id: 10,
              message: 'hi',
              createdAt: '2022-05-06T05:45:19.522Z',
              sender: {
                id: 1,
                nickname: 'bbbbb',
                image: null,
              },
              receiver: {
                id: 2,
                nickname: 'aaa',
                image: null,
              },
            },
            {
              id: 9,
              message: 'hi',
              createdAt: '2022-05-06T05:44:16.664Z',
              sender: {
                id: 1,
                nickname: 'bbbbb',
                image: null,
              },
              receiver: {
                id: 2,
                nickname: 'aaa',
                image: null,
              },
            },
            {
              id: 8,
              message: 'hi',
              createdAt: '2022-05-06T05:44:15.550Z',
              sender: {
                id: 1,
                nickname: 'bbbbb',
                image: null,
              },
              receiver: {
                id: 2,
                nickname: 'aaa',
                image: null,
              },
            },
            {
              id: 7,
              message: 'hi',
              createdAt: '2022-05-06T05:43:33.023Z',
              sender: {
                id: 1,
                nickname: 'bbbbb',
                image: null,
              },
              receiver: {
                id: 2,
                nickname: 'aaa',
                image: null,
              },
            },
          ],
          meta: {
            itemCount: 10,
            totalItems: 16,
            totalPages: 2,
            currentPage: 1,
          },
          links: {
            '1': 'http://localhost:3065/api/dms/friends/8?page=2&perPage=10',
          },
        },
      },
    },
  })
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
  @UseGuards(ExistFriendGuard)
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
    type: CreateDMDto,
  })
  @ApiParam({
    name: 'friendId',
    description: 'Friend id',
    required: true,
  })
  @ApiOperation({ summary: 'DM 생성' })
  @UseGuards(ExistFriendGuard)
  @Post(':friendId')
  async create(
    @Body() createDMDto: CreateDMDto,
    @Param('friendId') friendId: number,
    @UserDecorator() user: UserProfile,
  ) {
    return await this.dmService.create(user.id, friendId, createDMDto);
  }
}
