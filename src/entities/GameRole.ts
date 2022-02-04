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
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

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
