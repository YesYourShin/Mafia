import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Image } from '.';
import { Comment } from './comment.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('profile')
export class Profile {
  @ApiProperty({
    example: 1,
    description: '프로필 고유 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'gjgjajaj',
    description: '닉네임',
  })
  @IsString()
  @IsNotEmpty()
  @Index('UX_PROFILE_NICKNAME', { unique: true })
  @Column('varchar', {
    name: 'nickname',
    unique: true,
    length: 20,
  })
  nickname: string;

  @ApiProperty({
    example: 1,
    description: 'image id',
  })
  @IsInt()
  @Column({ type: 'int', name: 'image_id', nullable: true })
  imageId: number;

  @OneToOne(() => Image, (image) => image.profile, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Image;

  @ApiProperty({
    example: '안녕하세요 OOO입니다.',
    description: '한줄 소개',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Column('varchar', { name: 'self_introduction', nullable: true })
  selfIntroduction?: string | null;

  @ApiProperty({
    example: 50,
    description: '게임 매너 점수',
  })
  @Column('int', { name: 'manner', default: 50 })
  manner?: number;

  @ApiProperty({
    example: 3,
    description: '게임 레벨',
  })
  @IsInt()
  @Column('int', { name: 'level', default: 1 })
  level?: number;

  @ApiProperty({
    example: 1214,
    description: '게임 경험치',
  })
  @IsInt()
  @Column('int', { name: 'exp', default: 0 })
  exp?: number;

  @ApiProperty({
    example: 1,
    description: '유저 ID',
  })
  @IsInt()
  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId: number;

  @OneToOne(() => User, (user) => user.profile, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

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

  @OneToMany(() => Post, (posts) => posts.profile)
  posts: Post[];

  @OneToMany(() => Comment, (comments) => comments.profile)
  comments: Comment[];
}
