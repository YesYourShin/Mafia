import { Image } from 'src/entities';
import { AbstractRepository, EntityRepository, QueryRunner } from 'typeorm';
import { ImageRemoveOptions } from './constants/image-remove-options';
import { ResponseImage } from './constants/response-image';
import { S3ImageObject } from './dto/s3-image-object';

@EntityRepository(Image)
export class ImageRepository extends AbstractRepository<Image> {
  async findOne(id: number): Promise<ResponseImage> {
    return await this.repository
      .createQueryBuilder('image')
      .select([
        'image.id',
        'image.originalname',
        'image.encoding',
        'image.mimetype',
        'image.size',
        'image.key',
        'image.location',
        'image.createdAt',
        'image.updatedAt',
      ])
      .where('image.id = :id', { id })
      .getOne();
  }

  async findByPostId(postId: number) {
    return await this.repository
      .createQueryBuilder('image')
      .leftJoin('image.imagePosts', 'imagePosts')
      .select(['image.id', 'image.key', 'image.location'])
      .where('imagePosts.postId = :postId', { postId })
      .getMany();
  }
  findByLocation<T extends string | string[]>(location: T): Promise<Image[]>;
  async findByLocation(location: string | string[]): Promise<Image[]> {
    const qb = this.repository
      .createQueryBuilder('image')
      .leftJoin('image.imagePosts', 'imagePosts')
      .select(['image.id', 'image.key', 'image.location']);

    Array.isArray(location)
      ? qb.where('image.location IN (:...location)', { location })
      : qb.where('image.location = :location', { location });

    return await qb.getMany();
  }
  findByKey<T extends string | string[]>(key: T): Promise<Image[]>;
  async findByKey(key: string | string[]) {
    const qb = this.repository
      .createQueryBuilder('image')
      .leftJoin('image.imagePosts', 'imagePosts')
      .select(['image.id', 'image.key']);

    Array.isArray(key)
      ? qb.where('image.key IN (:...key)', { key })
      : qb.where('image.key = :key', { key });

    return await qb.getMany();
  }

  async save(image: S3ImageObject, queryRunner?: QueryRunner) {
    const { originalname, encoding, mimetype, size, key, location } = image;
    return await this.repository
      .createQueryBuilder('image', queryRunner)
      .insert()
      .into(Image)
      .values({
        originalname,
        encoding,
        mimetype,
        size,
        key,
        location,
      })
      .execute();
  }

  async remove(
    imageRemoveOptions: ImageRemoveOptions,
    queryRunner?: QueryRunner,
  ) {
    const { id, key, location } = imageRemoveOptions;
    const qb = this.repository
      .createQueryBuilder('image', queryRunner)
      .delete()
      .from(Image);

    if (id) {
      Array.isArray(id)
        ? qb.where('image.id IN (:...id)', { id })
        : qb.where('image.id = :id', { id });
    } else if (key) {
      Array.isArray(key)
        ? qb.where('image.key IN (:...key)', { key })
        : qb.where('image.key = :key', { key });
    } else if (location) {
      Array.isArray(location)
        ? qb.where('image.location IN (:...location)', { location })
        : qb.where('image.location = :location', { location });
    }

    qb.execute();
  }
}
