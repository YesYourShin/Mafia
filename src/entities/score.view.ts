import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  expression: `
    select count(case when score='win' then 1 end) as win,
      count(case when score='lose' then 0 WHEN score='escape' THEN 0 end) as lose,
    	user_id
    from game_member
    group by user_id;
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
