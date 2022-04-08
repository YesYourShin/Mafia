import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Comment } from './comment.entity';
import { ImagePost } from './image-post.entity';
import { Like } from './like.entity';
import { Profile } from './profile.entity';
import { View } from './view.entity';

@Entity('post')
export class Post {
  @ApiProperty({
    example: 1,
    description: '게시물 ID',
  })
  @IsInt()
  @PrimaryGeneratedColumn()
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
  @Index('IDX_POST_CATEGORY_ID')
  @Column({
    name: 'category_id',
    nullable: true,
  })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.posts, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: Category;

  @ApiProperty({
    example: 1,
    description: '유저 ID',
  })
  @IsInt()
  @Index('IDX_POST_USER_ID')
  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => Profile, (profile) => profile.posts, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  profile: Profile;

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

  @OneToMany(() => Like, (likes) => likes.post)
  likes: Like[];

  @OneToMany(() => Comment, (comments) => comments.post)
  comments: Comment[];

  @OneToMany(() => View, (views) => views.post)
  views: View[];

  @OneToMany(() => ImagePost, (imagePost) => imagePost.post)
  imagePosts: ImagePost;
}
