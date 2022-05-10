import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('like')
export class Like {
  @ApiProperty({
    example: 1,
    description: '추천 고유 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: '게시물 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @Index('IDX_LIKE_POST_ID')
  @Column({ type: 'int', name: 'post_id' })
  postId: number;

  @ManyToOne(() => Post, (post) => post.likes, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: Post;

  @ApiProperty({
    example: 1,
    description: '유저 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @Index('IDX_LIKE_USER_ID')
  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.likes, {
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
