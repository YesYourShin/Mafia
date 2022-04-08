import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from 'src/entities';
import { promiseAllSetteldResult } from 'src/shared/promise-all-settled-result';
import { Connection } from 'typeorm';
import { ImageService } from '../image/image.service';
import {
  CreateProfileDto,
  ProfileInfo,
  UpdateProfileDto,
  UserProfile,
} from './dto';
import { ProfileRepository } from './profile.repository';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly imageService: ImageService,
    private readonly profileRepository: ProfileRepository,
    private readonly connection: Connection,
    @Inject(Logger) private readonly logger = new Logger('UserService'),
  ) {}

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException('등록되지 않은 유저입니다');
    }
    return user;
  }
  async findProfile(id: number): Promise<ProfileInfo> {
    const exProfile: Profile = await this.profileRepository.findProfile(id);
    if (!exProfile) {
      throw new NotFoundException('등록된 프로필이 없습니다');
    }
    return exProfile;
  }
  async createProfile(id: number, profile: CreateProfileDto) {
    const exProfile: Profile = await this.profileRepository.findProfile(id);
    if (exProfile) {
      throw new ForbiddenException('등록된 프로필이 존재합니다');
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (this.existImage(profile)) {
        const imageId = await this.imageService.save(
          profile.image,
          queryRunner,
        );
        profile.setImageId(imageId);
      }
      await this.profileRepository.create(id, profile, queryRunner);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'This is db error when create profile in user.service.ts',
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateProfile(user: UserProfile, updateProfileDto: UpdateProfileDto) {
    const { profile } = user;
    if (!profile) {
      throw new NotFoundException('등록된 프로필이 없습니다');
    }
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (this.existImage(updateProfileDto)) {
        if (this.existImage(profile)) {
          const { key } = profile.image;
          await this.imageService.remove({ key }, queryRunner);
          await this.imageService.deleteS3Object(key);
        }
        const imageId = await this.imageService.save(
          updateProfileDto.image,
          queryRunner,
        );
        updateProfileDto.imageId = imageId;
      }
      await this.profileRepository.update(
        profile.id,
        updateProfileDto,
        queryRunner,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'This is db error when update profile in user.service.ts',
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }
  async checkDuplicateNickname(nickname: string) {
    const exNickname = await this.profileRepository.checkDuplicateNickname(
      nickname,
    );
    if (exNickname) {
      throw new ForbiddenException('중복된 닉네임입니다');
    }
    return { message: '사용 가능한 닉네임입니다' };
  }
  async remove(id: number) {
    await this.userRepository.remove(id);
    return { message: '회원 탈퇴 성공' };
  }
  async removeImage(key: string) {
    try {
      const deleteObject = this.imageService.deleteS3Object(key);
      const remove = this.imageService.remove({ key });

      const { value, reason } = await promiseAllSetteldResult([
        deleteObject,
        remove,
      ]);

      if (reason) {
        this.logger.error('Error when remove image', reason);
      }

      return { remove: true, key };
    } catch (error) {
      this.logger.error(error);
    }
  }

  existImage(profile: ProfileInfo | CreateProfileDto | UpdateProfileDto) {
    return profile?.image ? true : false;
  }
}
