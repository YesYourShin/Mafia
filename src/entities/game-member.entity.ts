import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Score } from '../common/constants';
import { Game } from './game.entity';
import { GameRole } from './game-role.entity';
import { User } from './user.entity';

@Entity('game_member')
export class GameMember {
  @ApiProperty({
    example: 1,
    description: '게임 방 멤버 고유 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: '방 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @Column({ type: 'int', name: 'game_id', nullable: true })
  gameId: number | null;

  @ManyToOne(() => Game, (game) => game.members, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
  game: Game;

  @ApiProperty({
    example: 1,
    description: '게임 참여 유저 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @Column({ type: 'int', name: 'user_id', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, (user) => user.gameMembers, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ApiProperty({
    example: 1,
    description: '게임 역할',
  })
  @Column({
    name: 'game_role_id',
    nullable: true,
  })
  @IsNotEmpty()
  gameRoleId: number | null;

  @ManyToOne(() => GameRole, (role) => role.members, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'game_role_id', referencedColumnName: 'id' })
  gameRole: GameRole;

  @ApiProperty({
    example: 1,
    description: '1 - 승/0 - 패',
    required: false,
  })
  @IsNotEmpty()
  @Column({ type: 'tinyint', name: 'score', nullable: true })
  score: Score;

  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}
