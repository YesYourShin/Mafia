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
  @Column({
    type: 'enum',
    enum: [
      EnumCategory.ANNOUNCEMENT,
      EnumCategory.FREEBOARD,
      EnumCategory.INFORMATION,
    ],
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
