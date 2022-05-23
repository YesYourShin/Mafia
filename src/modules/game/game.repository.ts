import { Profile } from 'src/entities/profile.entity';
import { Game } from 'src/entities/game.entity';
import { AbstractRepository, EntityRepository, getConnection } from 'typeorm';
import { GameMember } from 'src/entities';
import { CreateGameDto } from '../gateway/create-game.dto';
import { Player } from '../game-room/dto/player';
import { User } from '../../entities/user.entity';

@EntityRepository(Game)
export class GameRepository extends AbstractRepository<Game> {
  

  async findAll(userId: number | any[], page: number, item: number) {
    const query = getConnection()
      .createQueryBuilder()
      .from(GameMember, 'gm2')
      .select('gm2.gameId')
      .where(`gm2.userId = ${userId}`)
      .take(item)
      .skip(item * (page - 1))
      .orderBy('gm2.updatedAt', 'DESC');

    const qb = getConnection()
      .createQueryBuilder()
      .from(Game, 'g')
      .innerJoin('g.members', 'gm')
      .innerJoin('gm.user', 'pf')
      .innerJoin('(' + query.getQuery() + ')', 't', 'g.id = t.gm2_game_id')
      .select(['g.id', 'g.mode', 'g.updatedAt'])
      .addSelect(['pf.nickname', 'pf.userId'])
      .addSelect(['gm.playNumber', 'gm.gameRoleName', 'gm.score'])
      .orderBy('g.updatedAt', 'DESC')
      .addOrderBy('gm.playNumber', 'ASC');

    return await qb.getMany();
  }

  async findOne(nickname: string) {
    const qb = await getConnection()
      .createQueryBuilder()
      .from(Profile, 'profile')
      .select('profile.userId')
      .where('profile.nickname = :nickname', { nickname })
      .getOne();
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

  
  async create(createGameDto: CreateGameDto, players: Player[]) {
    const queryRunner = getConnection().createQueryRunner();
    const queryBuilder = getConnection().createQueryBuilder(queryRunner);
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const gameId = (
        await queryBuilder
          .insert()
          .into(Game)
          .values({
            mode: createGameDto.mode,
            name: createGameDto.name,
            password: createGameDto.password,
            limit: createGameDto.limit,
          })
          .execute()
      ).identifiers[0].id;
      await queryBuilder
        .insert()
        .into(GameMember)
        .values(
          players.map((player, idx) => ({
            gameId,
            playNumber: idx + 1, // 카메라 번호
            gameRoleName: player.job,
            userId: player.userId,
          })),
        )
        .execute();
      await queryRunner.commitTransaction();
      return gameId;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async leave(player: Player) {
    const qb = getConnection().createQueryBuilder();

    

    return await 
  }

  async setRole(players: Player[]) {
    const qb = getConnection().createQueryBuilder();

    return await Promise.all(
      players.map((player) =>
        qb
          .update(GameMember)
          .set({ gameRoleName: player.job })
          .where('gameId = :gameId', { gameId: player.gameId })
          .andWhere('userId = :userId', { userId: player.userId })
          .execute(),
      ),
    );
  }
}
