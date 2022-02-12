import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';
import { GameRoleType } from 'src/constants/game-role-type';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GameMember } from './GameMember';

@Entity('game_role')
export class GameRole {
  @ApiProperty({
    example: 1,
    description: '게임 역할 고유 ID',
  })
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @ApiProperty({
    example: 'CITIZEN',
    description: '게임 역할 이름',
  })
  @IsEnum(GameRoleType)
  @Column({ type: 'enum', enum: GameRoleType, name: 'type' })
  type: GameRoleType;

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

  @OneToMany(() => GameMember, (members) => members.role)
  members: GameMember[];
}
