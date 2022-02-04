import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Chat } from './Chat';
import { User } from './User';

@Entity('whole_chat')
export class WholeChat extends Chat {
  @ManyToOne(() => User, (sender) => sender.wholeChats)
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  sender: User;
}
