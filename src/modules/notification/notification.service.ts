import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}
  async create(createnotificationdto: CreateNotificationDto) {
    return await this.notificationRepository.create(createnotificationdto);
  }

  async findall() {
    return await this.notificationRepository.findall();
  }

  async findone(id: number) {
    return await this.notificationRepository.findone(id);
  }

  async update(id: number, updatenotificationdto: UpdateNotificationDto) {
    return await this.notificationRepository.update(id, updatenotificationdto);
  }

  async read(id: number) {
    return await this.notificationRepository.read(id);
  }
}
