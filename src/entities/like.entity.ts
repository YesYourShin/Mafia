import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
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
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: '게시물 ID',
  })
  @IsInt()
  @Column({ type: 'bigint', name: 'post_id', nullable: true })
  postId: number;

  @ManyToOne(() => Post, (post) => post.likes)
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: Post;

  @ApiProperty({
    example: 1,
    description: '유저 ID',
  })
  @IsInt()
  @Column({ type: 'bigint', name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.likes)
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
