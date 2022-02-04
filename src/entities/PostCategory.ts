import { IsDate, IsInt, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './Post';

@Entity('post_category')
export class PostCategory {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

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
