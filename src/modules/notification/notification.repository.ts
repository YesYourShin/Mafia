import { Notification } from 'src/entities';
import { AbstractRepository, EntityRepository, getConnection } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ReadNotificationDto } from './dto/read-notification.dto';
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
      .execute();
  }

  async findall() {}

  async findOne(uuid: string) {
    return await getConnection()
      .createQueryBuilder()
      .from(Notification, 'notification')
      .where('notification.uuid = :uuid', { uuid })
      .getOne();
  }

  async update(id: number, updatenotificationdto: UpdateNotificationDto) {}

  async read(readNotificationDto: ReadNotificationDto) {
    const { uuid, uuids } = readNotificationDto;
    const qb = getConnection()
      .createQueryBuilder()
      .from(Notification, 'notification')
      .update({ read: true });

    if (uuids) {
      qb.where('notification.uuid IN (:...uuids)', { uuids });
    }
    if (uuid) {
      qb.where('notification.uuid = :uuid', { uuid });
    }
    return await qb.execute();
  }
}
