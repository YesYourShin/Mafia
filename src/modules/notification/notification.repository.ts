import { Notification } from 'src/entities';
import { AbstractRepository, EntityRepository, getConnection } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@EntityRepository(Notification)
export class NotificationRepository extends AbstractRepository<Notification> {
  async create(createnotificationdto: CreateNotificationDto) {
    return await getConnection()
      .createQueryBuilder()
      .from(Notification, 'notification')
      .insert()
      .into('notification')
      .values(createnotificationdto)
      .updateEntity(true)
      .returning([
        'uuid',
        'type',
        'data',
        'userId',
        'targetId',
        'read',
        'createdAt',
        'updatedAt',
      ])
      .execute();
  }

  async findall() {}

  async findone(id: number) {}

  async update(id: number, updatenotificationdto: UpdateNotificationDto) {}

  async read(uuid: string) {
    return await getConnection()
      .createQueryBuilder()
      .from(Notification, 'notification')
      .update({ read: true })
      .where('notification.uuid = :uuid', { uuid })
      .execute();
  }
}
