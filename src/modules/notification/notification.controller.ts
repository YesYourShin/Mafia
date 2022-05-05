import { Body, Controller, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { NotificationService } from './notification.service';
import { ExistUuidValidationPipe } from './pipes/exist-uuid-validation.pipe';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: '알람 읽음 처리' })
  @Patch(':uuid/read')
  async readNotification(
    @Body(new ExistUuidValidationPipe())
    readNotificationDto: ReadNotificationDto,
  ) {
    return await this.notificationService.read(readNotificationDto);
  }
}
