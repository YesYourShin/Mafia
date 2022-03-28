import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional, IsUUID } from 'class-validator';
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
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @ApiProperty({
    example: 'DM',
    description: '알림 타입',
  })
  @IsEnum(NotificationType)
  @Column({ type: 'enum', enum: NotificationType, name: 'type' })
  type: NotificationType;

  @ApiProperty({
    example: '',
    description: '알림 내용',
  })
  @Column({ type: 'varchar', name: 'data' })
  data: string;

  @ApiProperty({
    example: 1,
    description: '알림을 발송하는 유저',
  })
  @IsInt()
  @Column({ type: 'bigint', name: 'user_id', nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.sendNotifications)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ApiProperty({
    example: 1,
    description: '알림 받는 유저',
  })
  @IsInt()
  @Column({ type: 'bigint', name: 'target_id', nullable: true })
  targetId: number;

  @ManyToOne(() => User, (user) => user.receiveNotifications)
  @JoinColumn({ name: 'target_id', referencedColumnName: 'id' })
  target: User;

  @ApiProperty({
    example: 1,
    description: '1 - 읽음 0 - 안읽음',
  })
  @Column({ type: 'tinyint', name: 'read', default: 0 })
  read: number;

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
