import { User } from 'src/entities/user.entity';
import { AbstractRepository, EntityRepository, getConnection } from 'typeorm';
import { JoinRequestUserDto } from './dto/join-request-user.dto';
import { UserFindOneOptions } from './constants';
import { removeNilFromObject } from 'src/common/constants';
import { UserProfile } from './dto';
import { Friend } from 'src/entities';
import { RankingDto } from './dto/response-ranking.dto';
import { EnumStatus } from 'src/common/constants/enum-status';
import { VFriend } from 'src/entities/friend.view';

@EntityRepository(User)
export class UserRepository extends AbstractRepository<User> {
  async findOne(options: UserFindOneOptions = {}): Promise<UserProfile> {
    if (!Object.keys(removeNilFromObject(options)).length) return null;

    const { id, socialId, provider } = options;

    const qb = this.repository
      .createQueryBuilder('user')
      .leftJoin('user.profile', 'profile')
      .leftJoin('profile.image', 'image')
      .select([
        'user.id',
        'user.socialId',
        'user.provider',
        'user.role',
        'user.createdAt',
        'user.updatedAt',
      ])
      .addSelect([
        'profile.id',
        'profile.nickname',
        'profile.selfIntroduction',
        'profile.manner',
        'profile.level',
        'profile.exp',
        'profile.userId',
        'profile.createdAt',
        'profile.updatedAt',
      ])
      .addSelect([
        'image.id',
        'image.key',
        'image.location',
        'image.createdAt',
        'image.updatedAt',
      ]);

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
  async getRanking(take: number, skip: number): Promise<RankingDto> {
    const query =
      "SELECT p3.nickname,p3.level,p3.exp,p3.row_num, image.location FROM (SELECT nickname,level,exp, image_id, @RANK := IF(@PF_NICKNAME=nickname, @RANK + 1, 1) AS row_num, @PF_NICKNAME := nickname,@PF_EXP := exp FROM (SELECT p1.nickname, p1.level, p1.exp, p1.image_id FROM profile p1 ORDER BY p1.nickname, p1.exp DESC LIMIT ? OFFSET ?) p2, (SELECT @RANK := 1, @PF_NICKNAME := '', @PF_EXP := '') tmp) p3 LEFT JOIN image ON image.id=p3.image_id ORDER BY p3.nickname,p3.row_num;";
    const param = [take, skip];
    return await getConnection().query(query, param);
  }
  async requestFriend(userId: number, friendId: number) {
    return await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Friend)
      .values([
        {
          userId,
          friendId,
        },
      ])
      .execute();
  }

  async acceptFriend(userId: number, friendId: number) {
    return await getConnection()
      .createQueryBuilder()
      .update(Friend)
      .set({
        status: EnumStatus.ACCEPT,
      })
      .where('userId = :userId', { userId })
      .andWhere('friendId = :friendId', { friendId })
      .execute();
  }

  async rejectFriend(userId: number, friendId: number) {
    return await getConnection()
      .createQueryBuilder()
      .update(Friend)
      .set({
        status: EnumStatus.REJECT,
      })
      .where('userId = :userId', { userId })
      .andWhere('friendId = :friendId', { friendId })
      .execute();
  }
  async removeFriend(userId: number, friendId: number) {
    return await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Friend)
      .where('userId = :userId', { userId })
      .andWhere('friendId = :friendId', { friendId })
      .execute();
  }

  async findFriend(userId: number, friendId?: number): Promise<any> {
    const qb = getConnection()
      .createQueryBuilder()
      .from(VFriend, 'friend')
      .leftJoin('friend.friendProfile', 'profile')
      .leftJoin('profile.image', 'image')
      .select(['profile.id', 'profile.userId', 'profile.nickname'])
      .addSelect(['image.location'])
      .where('friend.userId = :userId', { userId });

    if (friendId) {
      qb.andWhere('friend.friendId = :friendId', { friendId });
      return await qb.getOne();
    }

    return await qb.getMany();
  }
}
