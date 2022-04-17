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
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('dm')
export class DM {
  @ApiProperty({
    example: 1,
    description: 'DM 아이디',
  })
  @IsInt()
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '안녕하세요 DM 입니다.',
    description: '채팅 메세지',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', name: 'message' })
  message: string;

  @ApiProperty({
    example: 1,
    description: '보내는 유저 아이디',
  })
  @IsInt()
  @IsNotEmpty()
  @Column({ type: 'int', name: 'sender_id', nullable: true })
  senderId: number | null;

  @ManyToOne(() => User, (sender) => sender.senderDm, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  sender: User;

  @ApiProperty({
    example: 1,
    description: '받는 유저 아이디',
  })
  @IsInt()
  @Column({
    type: 'int',
    name: 'receiver_id',
    nullable: true,
  })
  @IsNotEmpty()
  receiverId: number | null;

  @ManyToOne(() => User, (user) => user.receiveDm, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'receiver_id', referencedColumnName: 'id' })
  receiver: User;
  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}
