import { Injectable } from '@nestjs/common';
import { Notification } from 'src/entities';
import {
  CreateNotificationDto,
  ReadNotificationDto,
  UpdateNotificationDto,
} from './dto';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}
  async create(createnotificationdto: CreateNotificationDto) {
    const { id } = (
      await this.notificationRepository.create(createnotificationdto)
    ).identifiers[0];
    return await this.findOne(id);
  }

  async findall() {
    return await this.notificationRepository.findall();
  }

  async findOne(id: string): Promise<Notification> {
    return await this.notificationRepository.findOne(id);
  }

  async update(id: number, updatenotificationdto: UpdateNotificationDto) {
    return await this.notificationRepository.update(id, updatenotificationdto);
  }

  async read(readNotificationDto: ReadNotificationDto) {
    const { uuid, uuids } = readNotificationDto;
    await this.notificationRepository.read(readNotificationDto);
    if (uuids) {
      return { uuids, read: true };
    }
    return { uuid, read: true };
  }
}
