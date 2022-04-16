import { removeNilFromObject } from 'src/common/constants';
import { ImagePost } from 'src/entities/image-post.entity';
import {
  AbstractRepository,
  EntityRepository,
  getConnection,
  InsertResult,
  QueryRunner,
} from 'typeorm';
import { ImagePostRemoveOptions } from './constants/image-post-remove-options';

@EntityRepository(ImagePost)
export class ImagePostRepository extends AbstractRepository<ImagePost> {
  async findByPostId(postId: number) {
    return await this.repository
      .createQueryBuilder('imagePost')
      .leftJoin('imagePost.image', 'image')
      .select(['image.id', 'image.key'])
      .where('imagePost.postId = :postId', { postId })
      .getMany();
  }

  save<T extends number, U extends number | number[]>(
    postId: T,
    imageId: U,
    queryRunner?: QueryRunner,
  ): U extends number | number[] ? Promise<InsertResult> : never;
  async save(
    postId: number,
    imageId: number | number[],
    queryRunner?: QueryRunner,
  ): Promise<InsertResult> {
    if (Array.isArray(imageId)) {
      return await getConnection()
        .createQueryBuilder(queryRunner)
        .insert()
        .into(ImagePost)
        .values(imageId.map((id) => ({ postId, imageId: id })))
        .execute();
    }
    await this.repository
      .createQueryBuilder()
      .insert()
      .into(ImagePost)
      .values({
        postId,
        imageId,
      })
      .execute();
  }

  async remove(options: ImagePostRemoveOptions = {}) {
    if (!Object.keys(removeNilFromObject(options)).length) return null;

    const qb = this.repository.createQueryBuilder().delete().from(ImagePost);

    const { id, postId, imageId } = options;

    if (id) {
      qb.where('id = :id', { id });
    }
    if (postId) {
      qb.where('postId = :postId', { postId });
    }
    if (imageId) {
      // imageId 단독으로 사용할 일 x  -> andWhere
      qb.andWhere('imageId = :imageId', { imageId });
    }

    return await qb.execute();
  }
}
