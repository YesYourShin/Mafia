import { ApiProperty } from '@nestjs/swagger';
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
import { Post } from './post.entity';

@Entity('view')
export class View {
  @ApiProperty({
    example: 1,
    description: '조회수 고유 ID',
  })
  @IsInt()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 21312,
    description: '조회수',
  })
  @Column({ type: 'int', name: 'hit' })
  hit: number;

  @ApiProperty({
    example: 1,
    description: '게시물 아이디',
  })
  @IsInt()
  @Column({ type: 'int', name: 'post_id', nullable: true })
  postId: number | null;

  @ManyToOne(() => Post, (post) => post.views, {
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
