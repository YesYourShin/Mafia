import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
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
import { EnumCategory } from '../common/constants';

@Entity('post')
export class Post {
  @ApiProperty({
    example: 1,
    description: '게시물 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '질문 올립니다.',
    description: '게시물 제목',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 100 })
  title: string;

  @ApiProperty({
    example: '<html><div>안녕하세요</div></html>',
    description: '게시물 내용 html',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text', name: 'content' })
  content: string;

  @ApiProperty({
    example: '자유게시판/정보게시판/공지사항/전체게시판/인기게시판',
    description: '게시물 카테고리 이름',
  })
  @IsEnum(EnumCategory)
  @IsNotEmpty()
  @Index('IDX_POST_CATEGORY_Name')
  @Column({
    type: 'enum',
    enum: [
      EnumCategory.ANNOUNCEMENT,
      EnumCategory.FREEBOARD,
      EnumCategory.INFORMATION,
    ],
    name: 'category_name',
    nullable: true,
  })
  categoryName?: EnumCategory;

  @ManyToOne(() => Category, (category) => category.posts, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_name', referencedColumnName: 'name' })
  category: Category;

  @ApiProperty({
    example: 1,
    description: '유저 ID',
  })
  @IsInt()
  @IsNotEmpty()
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
