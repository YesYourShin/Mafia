import { Profile } from 'src/entities/profile.entity';
import { Game } from 'src/entities/game.entity';
import {
  AbstractRepository,
  EntityRepository,
  getConnection,
  QueryRunner,
} from 'typeorm';
import { GameMember } from 'src/entities';

@EntityRepository(Game)
export class GameRepository extends AbstractRepository<Game> {
  async findAll(userId: number | any[], page: number, item: number) {
    // const query =
    //   'SELECT g.name, pr.nickname, g.`mode`, gr.role, gm.score, g.updatedAt FROM game g JOIN game_member gm ON g.id = gm.game_id JOIN profile pr ON gm.user_id = pr.user_id JOIN game_role gr ON gm.game_role_id = gr.id LEFT JOIN (SELECT gm2.game_id FROM game_member gm2 WHERE gm2.user_id = 1 ) AS t ON g.id = t.game_id ORDER BY g.updatedAt DESC;';
    // return await getConnection().query(query);

    // 유저아이디로 게임 멤버에서 참여한 게임 방을 알아냄
    // const qb = await getConnection()
    //   .createQueryBuilder()
    //   .from(GameMember, 'gm')
    //   .select(['gm.gameId'])
    //   .where('gm.user_id = :userId', { userId })
    //   .limit(item)
    //   .offset(page * item);

    // const qb2 = await getConnection()
    //   .createQueryBuilder()
    //   .from(Game, 'g')
    //   .select('g.userId')
    //   .where((sq) => {
    //     const subQuery = sq
    //       .subQuery()
    //       .from(GameMember, 'gm')
    //       .select(['gm.gameId'])
    //       .where('gm.user_id = :userId', { userId })
    //       .getQuery();
    //     return 'g.userId IN ' + subQuery;
    //   })
    //   .limit(item)
    //   .offset(page * item);

    // 찾은 게임방을 기준으로 같은 게임에 참여한 사람들을 찾기
    const qb3 = getConnection()
      .createQueryBuilder()
      .from(Game, 'g')
      .innerJoin('g.members', 'gm')
      .innerJoin('gm.user', 'pf')
      .innerJoin('gm.gameRole', 'gr')
      .select(['g.name', 'g.mode', 'g.updatedAt'])
      .addSelect(['pf.nickname'])
      .addSelect(['gr.role'])
      .addSelect(['gm.score'])
      .where((sq) => {
        const subQuery = sq
          .subQuery()
          .from(GameMember, 'gm')
          .select(['gm.gameId'])
          .where('gm.user_id = :userId', { userId })
          .take(item)
          .skip(item * (page - 1))
          .getQuery();
        return 'g.userId IN ' + subQuery;
      })
      .orderBy('g.updatedAt', 'DESC');

    const qb4 = getConnection()
      .createQueryBuilder()
      .from(Game, 'g')
      .innerJoin('g.members', 'gm')
      .innerJoin('gm.user', 'pf')
      .innerJoin('gm.gameRole', 'gr')
      .select(['g.name', 'g.mode', 'g.updatedAt'])
      .addSelect(['pf.nickname'])
      .addSelect(['gr.role'])
      .addSelect(['gm.score'])
      .where((sq) => {
        const subQuery = sq
          .subQuery()
          .from(GameMember, 'gm')
          .select(['gm.gameId'])
          .where('gm.user_id = :userId', { userId })
          .take(item)
          .skip(item * (page - 1))
          .getQuery();
        return 'g.userId IN ' + subQuery;
      })
      .orderBy('g.updatedAt', 'DESC');

    return await qb4.getRawAndEntities();
  }

  async findOne(nickname: string) {
    // return await this.repository
    //   .createQueryBuilder('profile')
    //   //   .select('nickname')
    //   .where('nickname = :nickname', { nickname })
    //   .getOne();

    // const qb1 = getConnection()
    //   .createQueryBuilder(Game, 'g')
    //   .select([
    //     'g.name',
    //     'u.nickname',
    //     'g.mode',
    //     'gr.role',
    //     'gm.score',
    //     'g.updatedAt',
    //   ])
    //   .innerJoin('g.members', 'gm')
    //   .innerJoin('gm.user', 'u')
    //   .innerJoin('gm.gameRole', 'gr')
    //   .where('g.id = 1');

    const qb = await getConnection()
      .createQueryBuilder()
      .from(Profile, 'profile')
      .select('profile.userId')
      .where('profile.nickname = :nickname', { nickname })
      .getOne();

    // .where('g.id = 1');
    // console.log(qb.getParameters().nickname === nickname);
    // return (await qb).nickname === nickname;
    return qb ? qb.userId : false;

    /**
     * getMany
     * 엔티티에서 정해놓은 틀을 벗어나면
     * getMany로 자동 데이터 매핑이 안됨
     * Ex) .select('COUNT(*) AS count') <- 이 예가 적절한 예인지는 모르겠음
     * 이런식으로 할 때 정해놓은 컬럼이름도 아니고 형식을 벗어난거라서
     * 데이터 매핑을 안해줘서 Postman으로 볼 때 데이터가 안나오는 경우가 있음
     * 이럴 때는 raw data로 나오게 되는데
     * getMany를 할 경우에는 getRawAndEntities 쓰는편이 좋음
     * getRawAndEntities -> 배열형식 -> [0] raw data [1] entities(getMany 결과값)
     * 안나오던 데이터들이 raw data에 있으므로 자기가 직접 매핑해주면 됨
     * 이런 경우가 있다...
     */
  }
}
