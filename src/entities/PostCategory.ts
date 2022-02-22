import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './Post';

@Entity('post_category')
export class PostCategory {
  @ApiProperty({
    example: 1,
    description: '게시물 카테고리 ID',
  })
  @IsInt()
  @PrimaryColumn({ type: 'tinyint', name: 'id', unsigned: true })
  id: number;

  @ApiProperty({
    example: 1,
    description: '게시물 카테고리 이름',
  })
  @Column({ type: 'varchar', length: 10 })
  name: string;

  @OneToMany(() => Post, (posts) => posts.postCategory)
  posts: Post[];

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
