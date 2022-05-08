import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Notification } from 'src/entities';
import { Pagination } from '../post/paginate';
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
    private readonly configService: ConfigService,
  ) {}
  async create(createnotificationdto: CreateNotificationDto) {
    const { uuid } = (
      await this.notificationRepository.create(createnotificationdto)
    ).identifiers[0];
    console.log(uuid);
    return await this.findOne(uuid);
  }

  async findAll(userId: number, page: number, perPage: number) {
    const { items, totalItems } = await this.notificationRepository.findAll(
      userId,
      page,
      perPage,
    );

    const totalPages = Math.ceil(totalItems / perPage);
    const itemCount = items.length;
    const links = {};

    for (let i = 1; i <= 5; i++) {
      const tempPage = page + i;
      if (tempPage > totalPages) break;
      links[i] = `${this.configService.get(
        'BACKEND_URL',
      )}/users/notifications?page=${tempPage}&perPage=${perPage}`;
    }

    const data = new Pagination(
      items,
      {
        itemCount,
        totalItems,
        totalPages,
        currentPage: page,
      },
      links,
    );

    return data;
  }

  async findOne(uuid: string): Promise<Notification> {
    return await this.notificationRepository.findOne(uuid);
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
