import { Post, Like } from 'src/entities';
import {
  AbstractRepository,
  EntityRepository,
  getConnection,
  QueryRunner,
} from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CategoryEnum } from 'src/common/constants';

@EntityRepository(Post)
export class PostRepository extends AbstractRepository<Post> {
  async existPost(id: number) {
    return await this.repository
      .createQueryBuilder('post')
      .where('id = :id', { id })
      .getOne();
  }
  async findOne(
    id: number,
    userId?: number,
  ): Promise<{ entities: Post[]; raw: any[] }> {
    const qb = this.repository
      .createQueryBuilder('post')
      .leftJoin('post.profile', 'postProfile')
      .leftJoin('postProfile.image', 'postProfileImage')
      .leftJoin('post.comments', 'comment')
      .leftJoin('comment.profile', 'commentProfile')
      .leftJoin('commentProfile.image', 'commentProfileImage')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.categoryId',
        'post.updatedAt',
      ])
      .addSelect(['postProfile.id', 'postProfile.nickname'])
      .addSelect(['postProfileImage.id', 'postProfileImage.location'])
      .addSelect(['comment.id', 'comment.content', 'comment.updatedAt'])
      .addSelect(['commentProfile.id', 'commentProfile.nickname'])
      .addSelect(['commentProfileImage.id', 'commentProfileImage.location'])
      .orderBy('comment.updatedAt')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .loadRelationCountAndMap('comment.replyCount', 'comment.children')
      .where('post.id = :id', { id })
      .andWhere('comment.parentId IS NULL');

    if (userId) {
      qb.addSelect((subQuery) => {
        return subQuery
          .select('True')
          .from(Like, 'like')
          .where('like.userId = :userId', { userId })
          .where('like.postId = post.id')
          .limit(1);
      }, 'isLiked');
    }

    return await qb.getRawAndEntities();
  }
  async findAll(categoryId: number, skip: number) {
    console.log('skip', skip);
    const qb = this.repository
      .createQueryBuilder('post')
      .leftJoin('post.profile', 'profile')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.updatedAt',
        'post.categoryId',
      ])
      .addSelect(['profile.id', 'profile.nickname'])
      .orderBy('post.id', 'DESC')
      .take(10)
      .skip(skip)
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .loadRelationCountAndMap('post.views', 'post.views');

    if (
      categoryId === CategoryEnum.ANNOUNCEMENT ||
      categoryId === CategoryEnum.FREEBOARD ||
      categoryId === CategoryEnum.INFORMATIN
    ) {
      qb.where('post.categoryId = :categoryId', { categoryId });
    } else {
      qb.where('post.categoryId IN (:...categoryId)', {
        categoryId: [2, 3],
      });
    }
    if (categoryId === CategoryEnum.POPULAR) {
      qb.leftJoin('post.likes', 'likes')
        .groupBy('post.id')
        .having('COUNT(likes.id) > 5');
    }

    return await qb.getMany();
  }
  async findPagesCountByCategoryId(categoryId: number) {
    const qb = this.repository
      .createQueryBuilder('post')
      .select('COUNT(*) AS postCount');
    if (
      categoryId === CategoryEnum.ANNOUNCEMENT ||
      categoryId === CategoryEnum.FREEBOARD ||
      categoryId === CategoryEnum.INFORMATIN
    ) {
      qb.where('post.categoryId = :categoryId', { categoryId });
    } else {
      qb.where('post.categoryId IN (:...categoryId)', {
        categoryId: [2, 3],
      });
    }
    if (categoryId === CategoryEnum.POPULAR) {
      qb.leftJoin('post.likes', 'likes')
        .groupBy('post.id')
        .having('COUNT(likes.id) > 5');
    }

    return await qb.getCount();
  }
  async create(userId: number, createPostDto: CreatePostDto) {
    const { title, content, categoryId } = createPostDto;
    return await this.repository
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values({
        title,
        content,
        categoryId,
        userId,
      })
      .execute();
  }
  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    queryRunner?: QueryRunner,
  ) {
    const { title, content, categoryId } = updatePostDto;

    const qb = getConnection()
      .createQueryBuilder(queryRunner)
      .update(Post)
      .set({
        title,
        content,
        categoryId,
      })
      .where('id = :id', { id })
      .execute();

    return qb;
  }
  async isLiked(postId: number, userId: number) {
    const qb = getConnection()
      .createQueryBuilder()
      .select('like.id')
      .from(Like, 'like')
      .where('like.postId = :postId', { postId })
      .andWhere('like.userId = :userId', { userId })
      .getOne();

    return qb;
  }
  async like(postId: number, userId: number) {
    const qb = getConnection()
      .createQueryBuilder()
      .insert()
      .into(Like)
      .values({ postId, userId });

    return await qb.execute();
  }
  async unlike(postId: number, userId: number) {
    const qb = getConnection()
      .createQueryBuilder()
      .delete()
      .from(Like)
      .where('postId = :postId', { postId })
      .andWhere('userId = :userId', { userId });

    return await qb.execute();
  }
  async remove(id: number) {
    const qb = this.repository
      .createQueryBuilder()
      .delete()
      .from(Post)
      .where('id = :id', { id })
      .execute();
    return qb;
  }
}
