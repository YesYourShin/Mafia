import { User } from 'src/entities/User';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { JoinRequestUserDto } from './dto/join-request-user.dto';
import { pickBy, isNil, negate } from 'lodash';

export interface UserFindOneOptions {
  id?: number;
  socialId?: string;
  provider?: string;
}

export const removeNilFromObject = (object: any) => {
  return pickBy(object, negate(isNil));
};

@EntityRepository(User)
export class UserRepository extends AbstractRepository<User> {
  async findOne(options: UserFindOneOptions = {}) {
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

  async firstOrCreate(joinRequestUser: JoinRequestUserDto) {
    const { socialId, provider } = joinRequestUser;
    const user = await this.findOne({ socialId, provider });
    if (!user) {
      const user = await this.repository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          socialId,
          provider,
        })
        .execute();

      return await this.findOne(user.identifiers[0].id);
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
