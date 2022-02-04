import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
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
import { Post } from './Post';
import { User } from './User';

@Entity('comment')
export class Comment {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @IsString()
  @Column({ type: 'varchar', length: 100 })
  content: string;

  @IsInt()
  @Column({ type: 'bigint', name: 'user_id', nullable: true, unsigned: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.posts, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @IsInt()
  @Column({ type: 'bigint', name: 'post_id', nullable: true, unsigned: true })
  postId: number | null;

  @ManyToOne(() => Post, (post) => post.comments, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: Post;

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
