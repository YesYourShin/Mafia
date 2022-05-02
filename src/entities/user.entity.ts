import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserProvider, UserRole } from '../common/constants';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Like } from './like.entity';
import { Friend } from './friend.entity';
import { GameMember } from './game-member.entity';
import { DM } from './dm.entity';
import { Notification } from './notification.entity';
import { Profile } from './profile.entity';
import { Report } from './report.entity';
import { VFriend } from './friend.view';

@Index('UX_USER_SOCIAL_ID_PROVIDER', ['socialId', 'provider'], {
  unique: true,
})
@Unique('UK_USER_SOCIAL_ID_PROVIDER', ['socialId', 'provider'])
@Entity('user')
export class User {
  @ApiProperty({
    example: 1,
    description: '유저 아이디',
  })
  @IsInt()
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '1241824124u8192489121',
    description: '소셜 회원 고유번호',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', name: 'social_id' })
  socialId: string;

  @ApiProperty({
    example: 'google',
    description: '플랫폼(google, naver, kakao)',
  })
  @IsNotEmpty()
  @IsEnum(UserProvider)
  @Column({
    type: 'enum',
    name: 'provider',
    enum: UserProvider,
  })
  provider: UserProvider;

  @ApiProperty({
    example: 0,
    description: '유저 권한(0 유저 / 1 어드민) ',
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  @Column({ type: 'tinyint', name: 'role', default: 0 })
  role: UserRole;

  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Like, (likes) => likes.user)
  likes: Like[];

  @OneToMany(() => GameMember, (gameMembers) => gameMembers.user)
  gameMembers: GameMember[];

  @OneToMany(() => DM, (dms) => dms.sender)
  senderDm: DM[];

  @OneToMany(() => DM, (dms) => dms.receiver)
  receiveDm: DM[];

  @OneToMany(() => Notification, (notifications) => notifications.user)
  sendNotifications: Notification[];

  @OneToMany(() => Notification, (notifications) => notifications.target)
  receiveNotifications: Notification[];

  @OneToMany(() => Report, (reports) => reports.user)
  reports: Report[];

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;
}
