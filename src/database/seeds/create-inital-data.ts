import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { EnumCategory, EnumGameRole } from '../../common/constants';
import { Category } from '../../entities/category.entity';
import { GameRole } from '../../entities/game-role.entity';
import { ReportType } from '../../entities/report-type.entity';

export class CreateInitialData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const queryRunner = connection.createQueryRunner();
    const queryBuilder = connection.createQueryBuilder(queryRunner);
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const gameRole = queryBuilder
        .insert()
        .into(GameRole)
        .values([
          { id: 1, name: EnumGameRole.CITIZEN },
          { id: 2, name: EnumGameRole.MAFIA },
          { id: 3, name: EnumGameRole.DOCTOR },
          { id: 4, name: EnumGameRole.POLICE },
        ])
        .execute();

      const reportType = queryBuilder
        .insert()
        .into(ReportType)
        .values([
          {
            id: 1,
            name: '다른 플레이어를 모욕하거나 괴롭히거나 공격적인 언어를 사용하는 행위',
          },
          {
            id: 2,
            name: '인종 차별, 성차별, 동성애 혐오, 장애인 차별 등과 같은 모든 혐오 발언',
          },
          {
            id: 3,
            name: '고의로 적에게 죽어주거나 적 팀을 도와주는 등 팀원들에게 피해를 끼치는 부정적인 태도로 플레이하여 의도적으로 게임을 망치는 행위',
          },
          {
            id: 4,
            name: '게임 도중에 나가거나 자리를 비우는 행위',
          },
          {
            id: 5,
            name: '다른 플레이어들의 게임 진행을 방해하는 언행이나 행동',
          },
          {
            id: 6,
            name: '부적절한 닉네임 사용',
          },
        ])
        .execute();

      const category = queryBuilder
        .insert()
        .into(Category)
        .values([
          { id: 1, name: EnumCategory.ANNOUNCEMENT },
          { id: 2, name: EnumCategory.FREEBOARD },
          { id: 3, name: EnumCategory.INFORMATION },
        ])
        .execute();

      await Promise.all([gameRole, reportType, category]);

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
