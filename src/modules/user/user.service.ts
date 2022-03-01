import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDto } from 'src/common/dto';
import { Profile } from 'src/entities';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { ProfileRepository } from './profile.repository';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException('등록되지 않은 유저입니다');
    }
    return user;
  }
  async findProfile(id: number): Promise<Profile> {
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
    return await this.profileRepository.create(id, profile);
  }

  async updateProfile(id: number, profile: UpdateProfileDto) {
    const exProfile: Profile = await this.findProfile(id);
    if (!exProfile) {
      throw new NotFoundException('등록된 프로필이 없습니다');
    }
    return await this.profileRepository.update(id, profile);
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
}
