import {
  AbstractRepository,
  EntityRepository,
  getConnection,
  QueryRunner,
} from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from 'src/entities';
import { removeNilFromObject } from 'src/common/constants';
import { ProfileFindOneOptions } from './constants/profile-find-options';

@EntityRepository(Profile)
export class ProfileRepository extends AbstractRepository<Profile> {
  async findOneWithImage(options: ProfileFindOneOptions = {}) {
    const { id, userId } = options;
    if (!Object.keys(removeNilFromObject(options)).length) return null;
    const qb = this.repository
      .createQueryBuilder('profile')
      .leftJoin('profile.image', 'image')
      .select([
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
      qb.where('profile.id = :id', { id });
    }
    if (userId) {
      qb.where('profile.userId = :userId', { userId });
    }
    return await qb.getOne();
  }

  async findOne(options: ProfileFindOneOptions = {}) {
    const { id, userId } = options;
    if (!Object.keys(removeNilFromObject(options)).length) return null;
    const qb = this.repository
      .createQueryBuilder('profile')
      .select([
        'profile.id',
        'profile.nickname',
        'profile.selfIntroduction',
        'profile.manner',
        'profile.level',
        'profile.exp',
        'profile.userId',
        'profile.createdAt',
        'profile.updatedAt',
      ]);
    if (id) {
      qb.where('profile.id = :id', { id });
    }
    if (userId) {
      qb.where('profile.userId = :userId', { userId });
    }
    return await qb.getOne();
  }

  async create(
    id: number,
    profile: CreateProfileDto,
    queryRunner?: QueryRunner,
  ) {
    return await this.repository
      .createQueryBuilder('profile', queryRunner)
      .insert()
      .into(Profile)
      .values({
        nickname: profile.nickname,
        imageId: profile?.imageId,
        selfIntroduction: profile?.selfIntroduction,
        userId: id,
      })
      .execute();
  }

  async update(
    id: number,
    updateProfileDto: UpdateProfileDto,
    queryRunner?: QueryRunner,
  ) {
    const { nickname, imageId, selfIntroduction, image } = updateProfileDto;

    if (image) {
      return await getConnection()
        .createQueryBuilder(queryRunner)
        .update(Profile)
        .set({ nickname, imageId, selfIntroduction })
        .where('id = :id', { id })
        .execute();
    }
    return await getConnection()
      .createQueryBuilder(queryRunner)
      .update(Profile)
      .set({ nickname, selfIntroduction })
      .where('id = :id', { id })
      .execute();
  }

  async findByNickname(nickname: string) {
    return await this.repository
      .createQueryBuilder('profile')
      .where('profile.nickname = :nickname', { nickname })
      .getOne();
  }

  async findUserByNickname(nickname: string) {
    return await getConnection()
      .createQueryBuilder()
      .from(Profile, 'profile')
      .leftJoin('profile.image', 'image')
      .select([
        'profile.id',
        'profile.nickname',
        'profile.level',
        'profile.userId',
      ])
      .addSelect(['image.location', 'image.originalname'])
      .where('profile.nickname = :nickname', { nickname })
      .getOne();
  }
}
