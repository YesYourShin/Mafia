import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { GameMode } from 'src/constants/game-mode';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GameChat } from './GameChat';
import { GameMember } from './GameMember';
import { User } from './User';

@Check(`"limit" > 5 AND "limit" < 11`)
@Entity('game')
export class Game {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @IsEnum(GameMode)
  @Column({
    type: 'enum',
    enum: GameMode,
    name: 'mode',
    default: GameMode.CLASSIC,
  })
  mode: GameMode;

  @IsString()
  @Column({ type: 'varchar', name: 'name', length: 100 })
  name: string;

  @IsString()
  @Column({ type: 'varchar', name: 'password', length: 20, nullable: true })
  password: string;

  @IsInt()
  @Column({ type: 'tinyint', name: 'limit' })
  limit: string;

  @IsInt()
  @Column({ type: 'bigint', name: 'owner_id', nullable: true, unsigned: true })
  ownerId: number | null;

  @ManyToOne(() => User, (user) => user.games, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'id' })
  owner: User;

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

  @OneToMany(() => GameMember, (members) => members.game)
  members: GameMember[];

  @OneToMany(() => GameChat, (chats) => chats.game)
  chats: GameChat[];
}
