import { Notification } from 'src/entities';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@EntityRepository(Notification)
export class NotificationRepository extends AbstractRepository<Notification> {
  async create(createnotificationdto: CreateNotificationDto) {}

  async findall() {}

  async findone(id: number) {}

  async update(id: number, updatenotificationdto: UpdateNotificationDto) {}

  async read(id: number) {}
}
