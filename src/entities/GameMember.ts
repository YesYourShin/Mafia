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
import { Game } from './Game';
import { GameRole } from './GameRole';
import { User } from './User';

@Entity('game_member')
export class GameMember {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @IsInt()
  @Column({ type: 'bigint', name: 'game_id', nullable: true, unsigned: true })
  gameId: number | null;

  @ManyToOne(() => Game, (game) => game.members, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
  game: Game;

  @IsInt()
  @Column({ type: 'bigint', name: 'user_id', nullable: true, unsigned: true })
  userId: number | null;

  @ManyToOne(() => User, (user) => user.games, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({
    type: 'bigint',
    name: 'game_role_id',
    nullable: true,
    unsigned: true,
  })
  gameRoleId: number | null;

  @ManyToOne(() => GameRole, (role) => role.members, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'game_role_id', referencedColumnName: 'id' })
  role: GameRole;

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
