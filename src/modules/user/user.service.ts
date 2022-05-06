import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { NotificationType } from 'src/common/constants';
import { EnumStatus } from 'src/common/constants/enum-status';
import { Notification, Profile } from 'src/entities';
import { promiseAllSetteldResult } from 'src/shared/promise-all-settled-result';
import { Connection } from 'typeorm';
import { ONLINE } from '../gateway/game-room/constants';
import { UserEvent } from '../gateway/game-room/constants/user-event';
import { UserGateway } from '../gateway/user/user.gateway';
import { ImageService } from '../image/image.service';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';
import { NotificationService } from '../notification/notification.service';
import { RedisService } from '../redis/redis.service';
import { ProfileFindOneOptions } from './constants/profile-find-options';
import {
  CreateProfileDto,
  ProfileInfo,
  UpdateProfileDto,
  UserProfile,
} from './dto';
import { RequestFriendRequestDto } from './dto/request-friend-request-dto';
import { FindUserByNickname } from './dto/response-find-user-by-nickname-dto';
import { RankingDto } from './dto/response-ranking.dto';
import { ProfileRepository } from './profile.repository';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly redisService: RedisService,
    private readonly userRepository: UserRepository,
    private readonly imageService: ImageService,
    private readonly profileRepository: ProfileRepository,
    private readonly userGateway: UserGateway,
    private readonly notificationService: NotificationService,
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
  async findProfileWithImage(
    options: ProfileFindOneOptions,
  ): Promise<ProfileInfo> {
    const exProfile: Profile = await this.profileRepository.findOneWithImage(
      options,
    );
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
      if (updateProfileDto?.image.location) {
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
    const exNickname = await this.profileRepository.findByNickname(nickname);
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

  async sendNotificationToOnlineUser(
    id: number,
    event: string,
    notification: Notification,
  ) {
    const online = await this.redisService.getbit(ONLINE, id);
    if (!online) {
      this.userGateway.server.to(`/user-${id}`).emit(event, notification);
    }
  }

  async requestFriend(
    profile: ProfileInfo,
    targetId: number,
    requestId: number,
  ) {
    if (profile.userId !== requestId) {
      throw new ForbiddenException('자신의 요청이 아닙니다');
    }

    const { friendId1, friendId2 } = this.checkOneWay(profile.userId, targetId);
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      await this.userRepository.requestFriend(friendId1, friendId2);

      const notification = await this.notificationService.create(
        new CreateNotificationDto(
          NotificationType.REQUESTED_FRIEND,
          JSON.stringify({ user: profile, message: '친구 요청' }),
          profile.userId,
          targetId,
        ),
      );
      await queryRunner.commitTransaction();

      try {
        await this.sendNotificationToOnlineUser(
          targetId,
          UserEvent.FRIEND_REQUEST,
          notification,
        );
      } catch (e) {
        this.logger.error('친구 신청 알림 발생 실패', e);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(error);
      throw new InternalServerErrorException('Database 친구 추가 에러 발생');
    } finally {
      await queryRunner.release();
    }
  }
  async friendAction(
    profile: ProfileInfo,
    id: number,
    requestId: number,
    requestFriendRequestDto: RequestFriendRequestDto,
  ) {
    if (profile.userId !== id) {
      throw new ForbiddenException('자신의 요청이 아닙니다');
    }

    const requestUser = this.profileRepository.findOne({ userId: requestId });
    if (!requestUser) {
      throw new NotFoundException('등록되지 않은 유저의 요청입니다');
    }

    return requestFriendRequestDto.requestAction === EnumStatus.ACCEPT
      ? this.acceptFriend(profile, requestId)
      : this.rejectFriend(profile, requestId);
  }

  async acceptFriend(profile: ProfileInfo, requestId: number) {
    const { friendId1, friendId2 } = this.checkOneWay(
      profile.userId,
      requestId,
    );
    await this.userRepository.acceptFriend(friendId1, friendId2);
    const friend = await this.profileRepository.findOneWithImage({
      userId: requestId,
    });
    this.userGateway.server
      .to(`/user-${requestId}`)
      .emit(UserEvent.FRIEND_REQUEST_ACCEPT, {
        type: EnumStatus.ACCEPT,
        user: profile,
      });
    return friend;
  }

  async rejectFriend(profile: ProfileInfo, requestId: number) {
    const { friendId1, friendId2 } = this.checkOneWay(
      profile.userId,
      requestId,
    );
    await this.userRepository.rejectFriend(friendId1, friendId2);
    return await this.userRepository.rejectFriend(profile.userId, requestId);
  }

  async removeFriend(id: number, friendId: number) {
    const { friendId1, friendId2 } = this.checkOneWay(id, friendId);
    await this.userRepository.removeFriend(friendId1, friendId2);
    return { delete: true, friendId };
  }

  checkOneWay(userId1: number, userId2: number) {
    return userId1 > userId2
      ? { friendId1: userId1, friendId2: userId2 }
      : { friendId1: userId2, friendId2: userId1 };
  }
  async existFriendRequest(userId: number, friendId: number) {
    const { friendId1, friendId2 } = this.checkOneWay(userId, friendId);
    return await this.existFriendRequest(friendId1, friendId2);
  }
}
