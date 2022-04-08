import {
  AbstractRepository,
  EntityRepository,
  getConnection,
  QueryRunner,
} from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from 'src/entities';

export interface ProfileFindOption {
  nickname: string;
}

@EntityRepository(Profile)
export class ProfileRepository extends AbstractRepository<Profile> {
  async findProfile(id: number) {
    return await this.repository
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
      ])
      .where('profile.userId = :id', { id })
      .getOne();
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

  async checkDuplicateNickname(nickname: string) {
    return await this.repository
      .createQueryBuilder('profile')
      .where('profile.nickname = :nickname', { nickname })
      .getOne();
  }
}
