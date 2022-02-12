import { Profile } from 'src/entities/Profile';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface ProfileFindOption {
  nickname: string;
}

@EntityRepository(Profile)
export class ProfileRepository extends AbstractRepository<Profile> {
  async findProfile(id: number) {
    return await this.createQueryBuilder('profile')
      .where('profile.userId = :userId', { userId: id })
      .getOne();
  }

  async create(id: number, profile: CreateProfileDto) {
    return await this.repository
      .createQueryBuilder()
      .insert()
      .into(Profile)
      .values({
        nickname: profile.nickname,
        image: profile?.image,
        selfIntroduction: profile?.selfIntroduction,
        userId: id,
      })
      .execute();
  }

  async update(id: number, profile: UpdateProfileDto) {
    return await this.repository
      .createQueryBuilder()
      .update(Profile)
      .set({
        nickname: profile.nickname,
        image: profile?.image,
        selfIntroduction: profile?.selfIntroduction,
      })
      .where('userId = :id', { id })
      .execute();
  }

  async checkDuplicateNickname(nickname: string) {
    return await this.repository
      .createQueryBuilder('profile')
      .where('profile.nickname = :nickname', { nickname })
      .getOne();
  }
}
