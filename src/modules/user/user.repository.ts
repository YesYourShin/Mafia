import { User } from 'src/entities/user.entity';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { JoinRequestUserDto } from './dto/join-request-user.dto';
import { UserFindOneOptions } from './constants';
import { removeNilFromObject } from 'src/common/constants';
import { UserProfile } from './dto';

@EntityRepository(User)
export class UserRepository extends AbstractRepository<User> {
  async findOne(options: UserFindOneOptions = {}): Promise<UserProfile> {
    if (Object.keys(removeNilFromObject(options)).length === 0) return null;

    const { id, socialId, provider } = options;

    const qb = this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile');

    if (id) {
      qb.andWhere('user.id = :id', { id });
    }
    if (socialId && provider) {
      qb.andWhere('user.socialId = :socialId', { socialId }).andWhere(
        'user.provider = :provider',
        { provider },
      );
    }
    return await qb.getOne();
  }

  async firstOrCreate(
    joinRequestUser: JoinRequestUserDto,
  ): Promise<UserProfile> {
    const { socialId, provider } = joinRequestUser;
    const user = await this.findOne({ socialId, provider });
    if (!user) {
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          socialId,
          provider,
        })
        .execute();
      return await this.findOne({ socialId, provider });
    }
    return user;
  }

  async remove(id: number) {
    return await this.repository
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('id = :id', { id })
      .execute();
  }
}
