import { isArray } from 'lodash';
import { removeNilFromObject } from 'src/common/constants';
import { ImagePost } from 'src/entities/image-post.entity';
import { AbstractRepository, EntityRepository } from 'typeorm';
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

  async save(postId: number, imageId: number | number[]) {
    if (isArray(imageId)) {
      return await this.repository
        .createQueryBuilder()
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
    if (Object.keys(removeNilFromObject(options)).length === 0) return null;

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
