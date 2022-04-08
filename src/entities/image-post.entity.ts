import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from '.';
import { Post } from './post.entity';

@Entity('image_post')
export class ImagePost {
  @IsInt()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: '이미지 아이디',
  })
  @IsInt()
  @Column({ name: 'image_id' })
  imageId: number;

  @ManyToOne(() => Image, (image) => image.imagePosts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Image;

  @ApiProperty({
    example: 1,
    description: '게시물 아이디',
  })
  @IsInt()
  @Column({ name: 'post_id' })
  postId: number;

  @ManyToOne(() => Post, (post) => post.imagePosts, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: Post;
}
