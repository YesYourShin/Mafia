import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Notification } from 'src/entities';
import { IPaginationLinks, Pagination } from '../post/paginate';
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

    const links: IPaginationLinks = {
      current: `${this.configService.get(
        'BACKEND_URL',
      )}/users/notifications?page=${page}&perPage=${perPage}`,
    };
    if (page < totalPages) {
      links.next = `${this.configService.get(
        'BACKEND_URL',
      )}/users/notifications?page=${page + 1}&perPage=${perPage}`;
    }
    const meta = {
      itemCount,
      totalItems,
      totalPages,
      currentPage: page,
    };

    const data = new Pagination(items, meta, links);

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
