import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { Profile } from './profile.entity';

@Entity('comment')
export class Comment {
  @ApiProperty({
    example: 1,
    description: '댓글 고유 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '안녕하세요 댓글입니다',
    description: '댓글 내용',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 100, comment: '댓글 내용' })
  content: string;

  @ApiProperty({
    example: 1,
    description: '유저 아이디',
  })
  @IsInt()
  @IsNotEmpty()
  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => Profile, (profile) => profile.comments, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  profile: Profile;

  @ApiProperty({
    example: 1,
    description: '게시물 아이디',
  })
  @IsInt()
  @IsNotEmpty()
  @Column({ type: 'int', name: 'post_id', nullable: true })
  postId: number | null;

  @ManyToOne(() => Post, (post) => post.comments, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: Post;

  @ApiProperty({
    example: 1,
    description: '댓글 부모 아이디',
  })
  @IsInt()
  @IsOptional()
  @Column({ type: 'int', name: 'parent_id', nullable: true })
  parentId?: number | null;

  @ManyToOne(() => Comment, (comment) => comment.children, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'id' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  @ApiProperty({
    example: '2022-03-12T12:32:25.716Z',
    description: '생성 날짜',
  })
  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2022-03-12T12:32:25.716Z',
    description: '수정 날짜',
  })
  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}
