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
import { Category } from './Category';
import { Comment } from './Comment';
import { Like } from './Like';
import { Profile } from './Profile';
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
    type: 'tinyint',
    name: 'category_id',
    nullable: true,
    unsigned: true,
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
  @Column({ type: 'bigint', name: 'user_id', nullable: true, unsigned: true })
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
}
