import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserGateway } from '../gateway/user/user.gateway';
import { Pagination } from '../post/paginate';
import { DMRepository } from './dm.repository';
import { CreateDMDto } from './dto/create-dm-dto';

@Injectable()
export class DMService {
  constructor(
    private readonly dmRepository: DMRepository,
    private readonly userGateway: UserGateway,
    private readonly configService: ConfigService,
  ) {}

  async findAll(
    userId: number,
    friendId: number,
    page: number,
    perPage: number,
  ) {
    const dmsInfo = await this.dmRepository.findAll(
      userId,
      friendId,
      page,
      perPage,
    );
    const items = dmsInfo[0];
    const totalItems = dmsInfo[1];

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

  async create(userId: number, friendId: number, createDMDto: CreateDMDto) {
    const { id } = (
      await this.dmRepository.create(userId, friendId, createDMDto)
    ).identifiers[0];

    const dm = await this.dmRepository.findOne(id);
    const nsp = '/user';

    this.userGateway.server
      .to([`${nsp}-${userId}`, `${nsp}-${friendId}`])
      .emit('dm', dm);

    return dm;
  }
}
