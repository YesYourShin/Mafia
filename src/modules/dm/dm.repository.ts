import { DM } from 'src/entities';
import { AbstractRepository, EntityRepository, getConnection } from 'typeorm';
import { CreateDMDto } from './dto/create-dm-dto';

@EntityRepository(DM)
export class DMRepository extends AbstractRepository<DM> {
  async findAll(
    userId: number,
    friendId: number,
    page: number,
    perPage: number,
  ) {
    const result = await getConnection()
      .createQueryBuilder()
      .from(DM, 'dm')
      .innerJoin('dm.sender', 'sender')
      .innerJoin('dm.receiver', 'receiver')
      .leftJoin('sender.image', 'senderImage')
      .leftJoin('receiver.image', 'receiverImage')
      .select(['dm.id', 'dm.message', 'dm.createdAt'])
      .addSelect(['sender.id', 'sender.nickname'])
      .addSelect(['receiver.id', 'receiver.nickname'])
      .addSelect(['senderImage.location', 'receiverImage.location'])
      .where(
        '((dm.senderId = :userId AND dm.receiverId = :friendId) OR (dm.receiverId = :userId AND dm.senderId = :friendId))',
        { friendId, userId },
      )
      .take(perPage)
      .skip(perPage * (page - 1))
      .orderBy('dm.createdAt', 'DESC')
      .getManyAndCount();
    return { items: result[0], totalItems: result[1] };
  }

  async findOne(id: number) {
    return await getConnection()
      .createQueryBuilder()
      .from(DM, 'dm')
      .leftJoin('dm.sender', 'sender')
      .leftJoin('dm.receiver', 'receiver')
      .select(['dm.id', 'dm.message', 'dm.createdAt'])
      .addSelect(['sender.id', 'sender.nickname', 'sender.image'])
      .where('dm.id = :id', { id })
      .getOne();
  }

  async create(senderId: number, receiverId: number, createDMDto: CreateDMDto) {
    const { message } = createDMDto;
    return await getConnection()
      .createQueryBuilder()
      .insert()
      .into(DM)
      .values({ senderId, receiverId, message })
      .execute();
  }
}
