import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Chat } from './Chat';
import { User } from './User';

@Entity('dm')
export class DM extends Chat {
  @ManyToOne(() => User, (sender) => sender.senderDm, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receiveDm, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'receiver_id', referencedColumnName: 'id' })
  receiver: User;
}
