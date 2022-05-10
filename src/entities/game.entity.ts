import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
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
import { GameMember } from './game-member.entity';
import { GameMode } from '../common/constants';
import { Profile } from './profile.entity';

@Check(`"limit" > 5 AND "limit" < 11`)
@Entity('game')
export class Game {
  @ApiProperty({
    example: 1,
    description: '게임 고유 ID',
  })
  @IsInt()
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'classic',
    description: '게임 모드 classic',
  })
  @IsEnum(GameMode)
  @Column({
    type: 'enum',
    enum: GameMode,
    default: GameMode.CLASSIC,
  })
  @IsNotEmpty()
  mode: GameMode;

  @ApiProperty({
    example: '초보만 ㄱ',
    description: '방 이름',
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', name: 'name', length: 100 })
  name: string;

  @ApiProperty({
    example: '1234',
    description: '방 비밀번호',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', name: 'password', length: 20, nullable: true })
  password?: string;

  @ApiProperty({
    example: 8,
    description: '방 인원제한 6 - 10',
  })
  @IsInt()
  @IsNotEmpty()
  @Column({ type: 'tinyint', name: 'limit' })
  limit: number;

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
}
