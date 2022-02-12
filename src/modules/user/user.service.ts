import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Profile } from 'src/entities/Profile';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileRepository } from './profile.repository';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async findOne(id: number) {
    return await this.userRepository.findOne({ id });
  }
  async createProfile(id: number, profile: CreateProfileDto) {
    const exProfile: Profile = await this.profileRepository.findProfile(id);
    if (exProfile) {
      throw new ForbiddenException('프로필이 이미 존재합니다.');
    }
    return await this.profileRepository.create(id, profile);
  }

  async updateProfile(id: number, profile: UpdateProfileDto) {
    const exProfile: Profile = await this.profileRepository.findProfile(id);
    if (!exProfile) {
      throw new NotFoundException('프로필이 존재하지 않습니다.');
    }
    return await this.profileRepository.update(id, profile);
  }
  async checkDuplicateNickname(nickname: string) {
    const exNickname = await this.profileRepository.checkDuplicateNickname(
      nickname,
    );
    if (exNickname) {
      throw new ForbiddenException('이미 존재하는 닉네임입니다');
    }
    return { message: '사용 가능한 닉네임입니다.' };
  }
  async remove(id: number) {
    await this.userRepository.remove(id);
    return { message: '회원 탈퇴 성공' };
  }
}
