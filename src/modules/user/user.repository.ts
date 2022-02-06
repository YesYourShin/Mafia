import { UnauthorizedException } from '@nestjs/common';
import { UserProvider } from 'src/constants';
import { User } from 'src/entities/User';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { JoinRequestUserDto } from './dto/join-request-user.dto';

@EntityRepository(User)
export class UserRepository extends AbstractRepository<User> {
  async findOneById(id: number): Promise<User> {
    const qb = await this.repository
      .createQueryBuilder('user')
      .where('user.id= :id', { id })
      .getOne();

    if (!qb) {
      throw new UnauthorizedException('인증되지 않은 사용자');
    }
    return qb;
  }
  async findOneByNickname(nickname: string): Promise<User> {
    const qb = await this.repository
      .createQueryBuilder('user')
      .where('user.nickname= :nickname', { nickname })
      .getOne();

    if (!qb) {
      throw new UnauthorizedException('인증되지 않은 사용자');
    }
    return qb;
  }
  async findOneByOauth(
    socialId: string,
    provider: UserProvider,
  ): Promise<User> {
    const qb = await this.repository
      .createQueryBuilder('user')
      .where('user.socialId= :socialId', { socialId })
      .andWhere('user.provider= :provider', { provider })
      .getOne();

    if (!qb) {
      throw new UnauthorizedException('인증되지 않은 사용자');
    }
    return qb;
  }

  async firstOrCreate(joinRequestUser: JoinRequestUserDto) {
    const { socialId, provider } = joinRequestUser;
    try {
      return await this.findOneByOauth(socialId, provider);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        const user = await this.repository
          .createQueryBuilder()
          .insert()
          .into(User)
          .values({
            socialId,
            provider,
          })
          .execute();

        return await this.findOneById(user.identifiers[0].id);
      } else {
        throw error;
      }
    }
  }
}
