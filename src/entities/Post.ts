import { IsDate, IsInt, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './Comment';
import { PostCategory } from './PostCategory';
import { Recommendation } from './Recommendation';
import { User } from './User';

@Entity('post')
export class Post {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @IsInt()
  @Column({
    type: 'bigint',
    name: 'post_category_id',
    nullable: true,
    unsigned: true,
  })
  postCategoryId: number;

  @ManyToOne(() => PostCategory, (category) => category.posts, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'post_category_id', referencedColumnName: 'id' })
  postCategory: PostCategory;

  @IsInt()
  @Column({ type: 'bigint', name: 'user_id', nullable: true, unsigned: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.posts, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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

  @OneToMany(() => Recommendation, (recommendations) => recommendations.post)
  recommendations: Recommendation[];

  @OneToMany(() => Comment, (comments) => comments.post)
  comments: Comment[];
}
