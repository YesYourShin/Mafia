import { Notification } from 'src/entities';
import { AbstractRepository, EntityRepository, getConnection } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ReadNotificationDto } from './dto/read-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@EntityRepository(Notification)
export class NotificationRepository extends AbstractRepository<Notification> {
  async create(createnotificationdto: CreateNotificationDto) {
    const { type, data, userId, targetId } = createnotificationdto;
    return await getConnection()
      .createQueryBuilder()
      .from(Notification, 'notification')
      .insert()
      .into('notification')
      .values({
        type,
        data,
        userId,
        targetId,
      })
      .execute();
  }

  async findAll(targetId: number, page: number, perPage: number) {
    const result = await getConnection()
      .createQueryBuilder()
      .from(Notification, 'notification')
      .select([
        'notification.uuid',
        'notification.type',
        'notification.data',
        'notification.read',
        'notification.userId',
        'notification.targetId',
        'notification.createdAt',
      ])
      .where('notification.targetId = :targetId', { targetId })
      .andWhere('notification.read = :read', { read: false })
      .take(perPage)
      .skip(perPage * (page - 1))
      .orderBy('notification.createdAt', 'DESC')
      .getManyAndCount();

    return { items: result[0], totalItems: result[1] };
  }

  async findOne(uuid: string) {
    return await getConnection()
      .createQueryBuilder()
      .from(Notification, 'notification')
      .select([
        'notification.uuid',
        'notification.type',
        'notification.data',
        'notification.read',
        'notification.userId',
        'notification.targetId',
        'notification.createdAt',
      ])
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
