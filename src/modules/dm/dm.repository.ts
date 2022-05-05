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
    return await getConnection()
      .createQueryBuilder()
      .from(DM, 'dm')
      .innerJoinAndSelect('dm.sender', 'sender')
      .innerJoinAndSelect('dm.receiver', 'receiver')
      .where(
        '((dm.senderId = :userId AND dm.receiverId = :friendId) OR (dm.receiverId = :userId AND dm.senderId = :friendId))',
        { friendId, userId },
      )
      .take(perPage)
      .skip(perPage * (page - 1))
      .orderBy('dm.createdAt', 'DESC')
      .getManyAndCount();
  }

  async findOne(id: number) {
    return await getConnection()
      .createQueryBuilder()
      .from(DM, 'dm')
      .leftJoin('dm.sender', 'sender')
      .leftJoin('dm.receiver', 'receiver')
      .select('*')
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
