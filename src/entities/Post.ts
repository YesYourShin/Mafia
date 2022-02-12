import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
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
import { View } from './View';

@Entity('post')
export class Post {
  @ApiProperty({
    example: 1,
    description: '게시물 ID',
  })
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @ApiProperty({
    example: '질문 올립니다.',
    description: '게시물 제목',
  })
  @IsString()
  @Column({ type: 'varchar', length: 100 })
  title: string;

  @ApiProperty({
    example: '<html><div>안녕하세요</div></html>',
    description: '게시물 내용 html',
  })
  @IsString()
  @Column({ type: 'text', name: 'content' })
  content: string;

  @ApiProperty({
    example: 1,
    description: '게시물 카테고리 ID',
  })
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

  @ApiProperty({
    example: 1,
    description: '유저 ID',
  })
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

  @OneToMany(() => View, (views) => views.post)
  views: View[];
}
