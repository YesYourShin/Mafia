import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsNotEmpty } from 'class-validator';
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
import { EnumGameRole, GameStatus } from '../common/constants';
import { Game } from './game.entity';
import { GameRole } from './game-role.entity';
import { Profile } from './profile.entity';

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
  @Index('IDX_GAME_MEMBER_GAME_ID')
  @Column({ type: 'int', name: 'game_id' })
  gameId: number;

  @ManyToOne(() => Game, (game) => game.members, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
  game: Game;

  @ApiProperty({
    example: 1,
    description: '게임 참여 유저 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @Index('IDX_GAME_MEMBER_USER_ID')
  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => Profile, (profile) => profile.gameMembers, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: Profile;

  @ApiProperty({
    example: 'mafia',
    description: '게임 역할 이름',
  })
  @Column({
    enum: EnumGameRole,
    name: 'game_role_name',
    nullable: true,
  })
  @IsNotEmpty()
  gameRoleName: EnumGameRole | null;

  @ManyToOne(() => GameRole, (role) => role.members, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'game_role_name', referencedColumnName: 'name' })
  gameRole: GameRole;

  @ApiProperty({
    example: 'win',
    description: 'win | lose | pending | escape',
    required: false,
  })
  @IsNotEmpty()
  @Column({
    type: 'enum',
    enum: GameStatus,
    name: 'score',
    default: GameStatus.PENDING,
  })
  score: GameStatus;

  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;
}
