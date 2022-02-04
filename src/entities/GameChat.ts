import { IsInt } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Chat } from './Chat';
import { Game } from './Game';
import { User } from './User';

@Entity('game_chat')
export class GameChat extends Chat {
  @ManyToOne(() => User, (user) => user.gameChats, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  sender: User;

  @IsInt()
  @Column({ type: 'bigint', name: 'game_id', nullable: true, unsigned: true })
  gameId: number | null;

  @ManyToOne(() => Game, (game) => game.chats, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'game_id', referencedColumnName: 'id' })
  game: Game;
}
