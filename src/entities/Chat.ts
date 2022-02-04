import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class Chat {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @IsString()
  @Column({ type: 'varchar', name: 'message' })
  message: string;

  @IsOptional()
  @IsInt()
  @Column({ type: 'bigint', name: 'sender_id', nullable: true, unsigned: true })
  senderId: number | null;

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
