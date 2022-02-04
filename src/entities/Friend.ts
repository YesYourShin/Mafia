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
import { User } from './User';

@Entity('friend')
export class Friend {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @IsInt()
  @Column({ type: 'bigint', name: 'user_id', nullable: true, unsigned: true })
  userId: number | null;

  @ManyToOne(() => User, (user) => user.friend1, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @IsInt()
  @Column({ type: 'bigint', name: 'friend_id', nullable: true, unsigned: true })
  friendId: number | null;

  @ManyToOne(() => User, (user) => user.friend2, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'friend_id', referencedColumnName: 'id' })
  friend: User;

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
