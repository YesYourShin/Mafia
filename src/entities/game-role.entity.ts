import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GameMember } from './game-member.entity';
import { EGameRole } from '../common/constants';

@Entity('game_role')
export class GameRole {
  @ApiProperty({
    example: 1,
    description: '게임 역할 고유 ID',
  })
  @IsInt()
  @PrimaryColumn()
  id: number;

  @ApiProperty({
    example: 'CITIZEN',
    description: '게임 역할 이름',
  })
  // @IsEnum(EGameRole)
  @Column({ type: 'enum', enum: EGameRole, name: 'role' })
  role: EGameRole;

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

  @OneToMany(() => GameMember, (members) => members.gameRole)
  members: GameMember[];
}
