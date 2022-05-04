import { Controller, Get, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('read')
  async readNotification(@Query('uuid') uuid: string) {
    return await this.notificationService.read(uuid);
  }
}
