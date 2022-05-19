import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT COUNT(CASE WHEN score='win' THEN 1 END) AS win,
    	COUNT(CASE WHEN score='lose' THEN 0 END) AS lose,
    	user_id
    FROM game_member
    GROUP BY user_id;
    `,
})
export class VScore {
  @ViewColumn({ name: 'win' })
  win: number;
  @ViewColumn({ name: 'lose' })
  lose: number;
  @ViewColumn({ name: 'user_id' })
  userId: number;
}
