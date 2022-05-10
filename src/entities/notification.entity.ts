import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
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
import { NotificationType } from '../common/constants';
import { User } from './user.entity';

@Entity('notification')
export class Notification {
  @ApiProperty({
    example: 'fsadfsadhjwewiu213adaadfadsfasfhw1',
    description: '알림 고유 UUID',
  })
  @IsUUID()
  @IsNotEmpty()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ApiProperty({
    example: 'DM',
    description: '알림 타입',
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  @Column({ type: 'enum', enum: NotificationType, name: 'type' })
  type: NotificationType;

  @ApiProperty({
    example: '',
    description: '알림 내용',
  })
  @IsNotEmpty()
  @Column({ type: 'varchar', name: 'data' })
  data: string;

  @ApiProperty({
    example: 1,
    description: '알림을 발송하는 유저',
  })
  @IsInt()
  @IsNotEmpty()
  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.sendNotifications, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ApiProperty({
    example: 1,
    description: '알림 받는 유저',
  })
  @IsInt()
  @IsNotEmpty()
  @Column({ type: 'int', name: 'target_id' })
  targetId: number;

  @ManyToOne(() => User, (user) => user.receiveNotifications, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_id', referencedColumnName: 'id' })
  target: User;

  @ApiProperty({
    example: false,
    default: false,
    description: 'true - 읽음 false - 안읽음',
  })
  @IsNotEmpty()
  @Column({ type: 'tinyint', name: 'read', default: false })
  read: boolean;

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
