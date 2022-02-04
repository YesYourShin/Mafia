import { int } from 'aws-sdk/clients/datapipeline';
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { UserProvider } from 'src/constants';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './Comment';
import { DM } from './DM';
import { Friend } from './Friend';
import { Game } from './Game';
import { GameChat } from './GameChat';
import { Notification } from './Notification';
import { Post } from './Post';
import { Recommendation } from './Recommendation';
import { Report } from './Report';
import { WholeChat } from './WholeChat';

@Index('user_idx_membership_code_provider', ['memberShipCode', 'provider'], {
  unique: true,
})
@Index('user_idx_nickname', ['nickname'], { unique: true })
@Unique('user_uk_membership_code_provider', ['memberShipCode', 'provider'])
@Entity('user')
export class User {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @Column({ type: 'varchar', name: 'membership_code' })
  memberShipCode: string;

  @IsEnum(UserProvider)
  @Column({
    type: 'enum',
    name: 'provider',
    enum: UserProvider,
  })
  provider: UserProvider;

  @IsString()
  @Column('varchar', {
    name: 'nickname',
    unique: true,
    length: 20,
    default: null,
  })
  nickname: string | null;

  @IsOptional()
  @Column('varchar', { name: 'image', nullable: true })
  image: string | null;

  @IsOptional()
  @Column('varchar', { name: 'self_introduction', nullable: true })
  selfIntroduction: string | null;

  @Column('int', { name: 'manner', default: 50 })
  manner: number;

  @Column('int', { name: 'level', default: 1 })
  level: string;

  @Column('int', { name: 'exp', default: 0 })
  exp: string;

  @OneToMany(() => Recommendation, (recommendations) => recommendations.user)
  recommendations: Recommendation[];

  @OneToMany(() => Post, (posts) => posts.user)
  posts: Post[];

  @OneToMany(() => Comment, (comments) => comments.user)
  comments: Comment[];

  @OneToMany(() => Friend, (friends) => friends.user)
  friend1: Comment[];

  @OneToMany(() => Friend, (friends) => friends.friend)
  friend2: Comment[];

  @OneToMany(() => Game, (gameroom) => gameroom.owner)
  games: Game[];

  @OneToMany(() => GameChat, (gamechats) => gamechats.sender)
  gameChats: GameChat[];

  @OneToMany(() => WholeChat, (wholeChats) => wholeChats.sender)
  wholeChats: WholeChat[];

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
}
