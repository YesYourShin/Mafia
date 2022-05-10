import { Profile } from 'src/entities/profile.entity';
import { Game } from 'src/entities/game.entity';
import {
  AbstractRepository,
  EntityRepository,
  getConnection,
  QueryRunner,
} from 'typeorm';
import { Post } from 'src/entities';

@EntityRepository(Game)
export class GameRepository extends AbstractRepository<Game> {
  async findAll(nickname: string, page: number, item: number) {
    const qb = this.repository.createQueryBuilder('game');
  }

  async findOne(nickname: string) {
    // return await this.repository
    //   .createQueryBuilder('profile')
    //   //   .select('nickname')
    //   .where('nickname = :nickname', { nickname })
    //   .getOne();
    const qb1 = getConnection()
      .createQueryBuilder(Game, 'g')
      // .select(['g.name'])
      .select([
        'g.name',
        'pf.nickname',
        'g.mode',
        'gr.role',
        'gm.score',
        'g.updatedAt',
      ])

      .innerJoin('g.members', 'gm')
      .innerJoin('gm.profile', 'pf')
      .innerJoin('gm.gameRole', 'gr')

      .where('g.id = 1');

    const qb2 = getConnection()
      .createQueryBuilder(Game, 'g')
      // .select(['g.name'])
      .select([
        'g.name',
        'pf.nickname',
        'g.mode',
        'gr.role',
        'gm.score',
        'g.updatedAt',
      ])

      .innerJoin('g.members', 'gm')
      .innerJoin('gm.profile', 'pf')
      .innerJoin('gm.gameRole', 'gr')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('gm.game_id')
          .from(Profile, 'pf')
          .innerJoin('pf.members', 'gm')
          .where('pf.nickname = 8')
          .getQuery();
        return 'g.id IN ' + subQuery;
      });
    // .where('g.id = 1');

    const qb3 = getConnection()
      .createQueryBuilder(Profile, 'pf')
      .select(['gm.game_id'])
      .innerJoin('pf.members', 'gm', 'pf.user_id = gm.user_id')
      .where('pf.nickname = 8');

    return await qb3.getMany();
  }
}
