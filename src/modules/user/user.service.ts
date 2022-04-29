import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Profile } from 'src/entities';
import { promiseAllSetteldResult } from 'src/shared/promise-all-settled-result';
import { Connection } from 'typeorm';
import { UserEvent } from '../gateway/game-room/constants/user-event';
import { UserGateway } from '../gateway/user/user.gateway';
import { ImageService } from '../image/image.service';
import {
  CreateProfileDto,
  ProfileInfo,
  UpdateProfileDto,
  UserProfile,
} from './dto';
import { FindUserByNickname } from './dto/response-find-user-by-nickname-dto';
import { RankingDto } from './dto/response-ranking.dto';
import { ProfileRepository } from './profile.repository';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly imageService: ImageService,
    private readonly profileRepository: ProfileRepository,
    private readonly userGateway: UserGateway,
    @Inject(Logger) private readonly logger = new Logger('UserService'),
    @InjectConnection() private readonly connection: Connection,
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
  async createProfile(user: UserProfile, profile: CreateProfileDto) {
    if (user?.profile) {
      throw new ForbiddenException('등록된 프로필이 존재합니다');
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (profile?.image?.location) {
        const imageId = await this.imageService.save(
          profile.image,
          queryRunner,
        );
        profile.setImageId(imageId);
      }
      await this.profileRepository.create(user.id, profile, queryRunner);

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
      if (updateProfileDto?.image) {
        if (profile?.image) {
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

  async findUserByNickname(nickname: string): Promise<FindUserByNickname> {
    const user = (await this.profileRepository.findUserByNickname(
      nickname,
    )) as FindUserByNickname;
    if (!user) {
      throw new NotFoundException('존재하지 않는 유저입니다');
    }
    return user;
  }
  async checkDuplicateNickname(nickname: string) {
    const exNickname = await this.profileRepository.findNickname(nickname);
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
  async getRanking(take: number, page: number): Promise<RankingDto> {
    const skip = (page - 1) * take;
    return await this.userRepository.getRanking(take, skip);
  }
  async requestFriend(userId: number, friendId: number) {
    await (this.checkOneWay(userId, friendId)
      ? this.userRepository.requestFriend(userId, friendId)
      : this.userRepository.requestFriend(friendId, userId));
    await this.userRepository.requestFriend(userId, friendId);
    this.userGateway.server
      .to(`/user-${friendId}`)
      .emit(UserEvent.FRIEND_REQUEST, { userId, message: '친구 요청' });
  }

  async acceptFriend(userId: number, friendId: number) {
    await (this.checkOneWay(userId, friendId)
      ? this.userRepository.acceptFriend(userId, friendId)
      : this.userRepository.acceptFriend(friendId, userId));
    await this.userRepository.findFriend(userId, friendId);
    this.userGateway.server
      .to(`/user-${friendId}`)
      .emit(UserEvent.FRIEND_REQUEST_ACCEPT, { userId, message: '친구 수락' });
  }

  async rejectFriend(userId: number, friendId: number) {
    await (this.checkOneWay(userId, friendId)
      ? this.userRepository.rejectFriend(userId, friendId)
      : this.userRepository.rejectFriend(friendId, userId));
    return await this.userRepository.rejectFriend(userId, friendId);
  }

  async removeFriend(userId: number, friendId: number) {
    await (this.checkOneWay(userId, friendId)
      ? this.userRepository.removeFriend(userId, friendId)
      : this.userRepository.removeFriend(friendId, userId));
    return { delete: true, friendId };
  }

  checkOneWay(userId1: number, userId2: number) {
    return userId1 > userId2;
  }
}
