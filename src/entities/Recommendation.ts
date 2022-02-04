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
import { Post } from './Post';
import { User } from './User';

@Entity('recommendation')
export class Recommendation {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @IsInt()
  @Column({ type: 'bigint', name: 'post_id', nullable: true, unsigned: true })
  postId: number;

  @ManyToOne(() => Post, (post) => post.recommendations)
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: Post;

  @IsInt()
  @Column({ type: 'bigint', name: 'user_id', nullable: true, unsigned: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.recommendations)
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
