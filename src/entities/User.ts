import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';
import { UserProvider, UserRole } from '../common/constants';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './Comment';
import { DM } from './DM';
import { Friend } from './Friend';
import { Game } from './Game';
import { Notification } from './Notification';
import { Post } from './Post';
import { Profile } from './Profile';
import { Like } from './Like';
import { Report } from './Report';
import { GameMember } from './GameMember';

@Index('user_idx_social_id_provider', ['socialId', 'provider'], {
  unique: true,
})
@Unique('user_uk_social_id_provider', ['socialId', 'provider'])
@Entity('user')
export class User {
  @ApiProperty({
    example: 1,
    description: '유저 아이디',
  })
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @ApiProperty({
    example: '1241824124u8192489121',
    description: '소셜 회원 고유번호',
  })
  @Column({ type: 'varchar', name: 'social_id' })
  socialId: string;

  @ApiProperty({
    example: 'google',
    description: '플랫폼(google, naver, kakao)',
  })
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

  @OneToMany(() => Post, (posts) => posts.user)
  posts: Post[];

  @OneToMany(() => Comment, (comments) => comments.user)
  comments: Comment[];

  @OneToMany(() => Friend, (friends) => friends.user)
  friend1: Comment[];

  @OneToMany(() => Friend, (friends) => friends.friend)
  friend2: Comment[];

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
