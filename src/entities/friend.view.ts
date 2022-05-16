import { EnumStatus } from '../common/constants/enum-status';
import { JoinColumn, ManyToOne, ViewColumn, ViewEntity } from 'typeorm';
import { Profile } from './profile.entity';

@ViewEntity({
  expression: `
        SELECT id, user_id, friend_id
        FROM friend
        where status = '${EnumStatus.ACCEPT}'
        UNION ALL
        SELECT id, friend_id, user_id
        FROM friend
        where status= '${EnumStatus.ACCEPT}'
    `,
})
export class VFriend {
  @ViewColumn({ name: 'id' })
  id: number;

  @ViewColumn({ name: 'user_id' })
  userId: number;
  @ManyToOne(() => Profile, (profile) => profile.friend1)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  vUser: Profile;

  @ViewColumn({ name: 'friend_id' })
  friendId: number;
  @ManyToOne(() => Profile, (profile) => profile.friend2)
  @JoinColumn({ name: 'friend_id', referencedColumnName: 'userId' })
  vFriend: Profile;
}
