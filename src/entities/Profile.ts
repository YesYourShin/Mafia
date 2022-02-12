import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDecimal,
  IsInt,
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
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Index('user_idx_nickname', ['nickname'], { unique: true })
@Entity('profile')
export class Profile {
  @ApiProperty({
    example: 1,
    description: '프로필 고유 ID',
  })
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @ApiProperty({
    example: 'gjgjajaj',
    description: '닉네임',
  })
  @IsString()
  @Column('varchar', {
    name: 'nickname',
    unique: true,
    length: 20,
  })
  nickname: string;

  @ApiProperty({
    example: 'https://aaa.com/cat.jpg',
    description: '이미지 url',
    required: false,
  })
  @IsOptional()
  @Column('varchar', { name: 'image', nullable: true })
  image?: string | null;

  @ApiProperty({
    example: '안녕하세요 OOO입니다.',
    description: '한줄 소개',
    required: false,
  })
  @IsOptional()
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
  @Column({ type: 'bigint', name: 'user_id', nullable: true, unsigned: true })
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
}
