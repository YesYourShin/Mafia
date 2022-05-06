import { Body, Controller, Patch } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { NotificationService } from './notification.service';
import { ExistUuidValidationPipe } from './pipes/exist-uuid-validation.pipe';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

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
