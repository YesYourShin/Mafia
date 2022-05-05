import { IsDate, IsInt, IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Profile } from './profile.entity';

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
  @Index('IDX_DM_SENDER_ID')
  @Column({ type: 'int', name: 'sender_id', nullable: true })
  senderId: number | null;

  @ManyToOne(() => Profile, (sender) => sender.senderDm, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'userId' })
  sender: User;

  @ApiProperty({
    example: 1,
    description: '받는 유저 아이디',
  })
  @IsInt()
  @IsNotEmpty()
  @Index('IDX_DM_RECEIVER_ID')
  @Column({
    type: 'int',
    name: 'receiver_id',
    nullable: true,
  })
  receiverId: number | null;

  @ManyToOne(() => Profile, (receiver) => receiver.receiverDm, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'receiver_id', referencedColumnName: 'userId' })
  receiver: User;
  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}
