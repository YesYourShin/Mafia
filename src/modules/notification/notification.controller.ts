import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserDecorator } from 'src/decorators';
import { LoggedInGuard } from '../auth/guards';
import { UserProfile } from '../user/dto';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { NotificationService } from './notification.service';
import { ExistUuidValidationPipe } from './pipes/exist-uuid-validation.pipe';

@ApiTags('Notifications')
@UseGuards(LoggedInGuard)
@Controller('users/:id/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiParam({
    name: 'id',
    required: true,
    description: '유저 ID',
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
    example: '?perPage=10',
    description: 'notification 불러올 개수',
  })
  @Get()
  async findAll(
    @UserDecorator() user: UserProfile,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    return await this.notificationService.findAll(user.id, page, perPage);
  }

  @ApiCreatedResponse({
    description: '알림 읽음 처리 성공',
    schema: {
      example: { uuid: '1234567890', read: true },
    },
  })
  @ApiBody({
    description:
      '알림 읽음 업데이트/uuid는 하나만 읽을 때 uuids는 한번에 다 읽을 때 사용',
    type: ReadNotificationDto,
  })
  @ApiOperation({ summary: '알람 읽음 처리' })
  @Patch('read')
  async readNotification(
    @Body(new ExistUuidValidationPipe())
    readNotificationDto: ReadNotificationDto,
  ) {
    return await this.notificationService.read(readNotificationDto);
  }
}
