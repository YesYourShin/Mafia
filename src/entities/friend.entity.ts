import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { EnumStatus } from 'src/common/constants/enum-status';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Profile } from './profile.entity';

@Unique('UK_FRIEND_USER_ID_FRIEND_ID', ['user', 'friendId'])
@Entity('friend')
export class Friend {
  @ApiProperty({
    example: 1,
    description: '친구 고유 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: '친구 신청 유저 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @Index('UX_FRIEND_USER_ID', { unique: true })
  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => Profile, (user) => user.friend1, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: Profile;

  @ApiProperty({
    example: 1,
    description: '받아준 친구 유저 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @Index('UX_FRIEND_FRIEND_ID', { unique: true })
  @Column({ type: 'int', name: 'friend_id' })
  friendId: number;

  @ManyToOne(() => Profile, (user) => user.friend2, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'friend_id', referencedColumnName: 'userId' })
  friend: Profile;

  @IsEnum(EnumStatus)
  @IsOptional()
  @Column({
    type: 'enum',
    enum: [EnumStatus.ACCEPT, EnumStatus.REJECT, EnumStatus.REQUEST],
    default: EnumStatus.REQUEST,
  })
  status: EnumStatus;

  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}
