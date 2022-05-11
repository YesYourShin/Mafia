import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { EnumCategory } from '../common/constants';

@Entity('category')
export class Category {
  @ApiProperty({
    example: 1,
    description: '게시물 카테고리 ID',
  })
  @IsInt()
  @PrimaryColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: '게시물 카테고리 이름',
  })
  @Index('UX_CATEGORY_NAME', { unique: true })
  @Column({
    type: 'enum',
    enum: EnumCategory,
    unique: true,
  })
  name: EnumCategory;

  @OneToMany(() => Post, (posts) => posts.category)
  posts: Post[];

  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}
