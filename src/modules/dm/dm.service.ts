import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationType } from 'src/common/constants';
import { ONLINE } from '../gateway/game-room/constants';
import { DM_EVENT } from '../gateway/game-room/constants/user-event';
import { UserGateway } from '../gateway/user/user.gateway';
import { CreateNotificationDto } from '../notification/dto';
import { NotificationService } from '../notification/notification.service';
import { Pagination } from '../post/paginate';
import { RedisService } from '../redis/redis.service';
import { ProfileInfo, UserProfile } from '../user/dto';
import { DMRepository } from './dm.repository';
import { CreateDMDto } from './dto/create-dm-dto';

@Injectable()
export class DMService {
  constructor(
    private readonly dmRepository: DMRepository,
    private readonly userGateway: UserGateway,
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
  ) {}

  async findAll(
    userId: number,
    friendId: number,
    page: number,
    perPage: number,
  ) {
    const { items, totalItems } = await this.dmRepository.findAll(
      userId,
      friendId,
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
      )}/dms/friends/${friendId}?page=${tempPage}&perPage=${perPage}`;
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

  async create(
    sender: ProfileInfo,
    receiverId: number,
    createDMDto: CreateDMDto,
  ) {
    const { id } = (
      await this.dmRepository.create(sender.userId, receiverId, createDMDto)
    ).identifiers[0];

    const dm = await this.dmRepository.findOne(id);

    const nsps = [`/user-${sender.userId}`];

    const online = await this.redisService.getbit(ONLINE, receiverId);
    if (online) {
      nsps.push(`/user-${receiverId}`);
    }
    this.userGateway.server.to(nsps).emit(DM_EVENT, {
      sender: {
        userId: sender.userId,
        nickname: sender.nickname,
      },
      receiver: {
        userId: receiverId,
      },
      message: createDMDto.message,
    });

    return dm;
  }
}
