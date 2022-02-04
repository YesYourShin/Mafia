import { IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';
import { NotificationType } from 'src/constants/notification-type';
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
import { User } from './User';

@Entity('notification')
export class Notification {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @IsEnum(NotificationType)
  @Column({ type: 'enum', enum: NotificationType, name: 'type' })
  type: NotificationType;

  @Column({ type: 'varchar', name: 'data' })
  data: string;

  @IsInt()
  @Column({ type: 'bigint', name: 'user_id', nullable: true, unsigned: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.sendNotifications)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @IsInt()
  @Column({ type: 'bigint', name: 'target_id', nullable: true, unsigned: true })
  targetId: number;

  @ManyToOne(() => User, (user) => user.receiveNotifications)
  @JoinColumn({ name: 'target_id', referencedColumnName: 'id' })
  target: User;

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
