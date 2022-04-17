import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsInt, IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ImagePost } from './image-post.entity';
import { Profile } from './profile.entity';

@Entity('image')
export class Image {
  @ApiProperty({
    example: 1,
    description: '아이디',
  })
  @IsInt()
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'cat.PNG',
    description: '파일 원본 이름',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar' })
  originalname: string;

  @ApiProperty({
    example: 'encoding',
    description: '7bit',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar' })
  encoding: string;

  @ApiProperty({
    example: 'mime type / 파일 종류',
    description: 'imag/png',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar' })
  mimetype: string;

  @ApiProperty({
    example: 36332,
    description: '파일 크기',
  })
  @IsDecimal()
  @IsNotEmpty()
  @Column('decimal', { precision: 10, scale: 2 })
  size: number;

  @ApiProperty({
    example: 'original/**/1649000570209_**.PNG',
    description: 'S3 Object key',
  })
  @Index('UX_IMAGE_KEY', { unique: true })
  @IsNotEmpty()
  @Column({ type: 'varchar', unique: true })
  key: string;

  @ApiProperty({
    example: 'https://***.**.**.com/original/**/1649000570209_**.PNG',
    description: '파일 경로',
  })
  @Index('UX_IMAGE_LOCATION', { unique: true })
  @IsNotEmpty()
  @Column({ type: 'varchar', unique: true })
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.image)
  profile: Profile;

  @OneToMany(() => ImagePost, (imagePosts) => imagePosts.image)
  imagePosts: ImagePost[];
}
