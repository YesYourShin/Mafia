import { BaseCategory, EnumCategoryName } from 'src/common/constants';
import { Post, Like } from 'src/entities';
import {
  AbstractRepository,
  EntityRepository,
  getConnection,
  QueryRunner,
} from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@EntityRepository(Post)
export class PostRepository extends AbstractRepository<Post> {
  async existPost(id: number) {
    return await this.repository
      .createQueryBuilder('post')
      .where('id = :id', { id })
      .getOne();
  }
  async findOne(id: number, userId?: number) {
    const qb = getConnection()
      .createQueryBuilder(Post, 'post')
      .leftJoin('post.profile', 'postProfile')
      .leftJoin('postProfile.image', 'postProfileImage')
      .leftJoin('post.comments', 'comment')
      .leftJoin('comment.profile', 'commentProfile')
      .leftJoin('commentProfile.image', 'commentProfileImage')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.categoryName',
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
  async findAll(categoryName: EnumCategoryName, take: number, skip: number) {
    console.log(categoryName);
    const qb = this.repository
      .createQueryBuilder('post')
      .leftJoin('post.profile', 'profile')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'post.updatedAt',
        'post.categoryName',
      ])
      .addSelect(['profile.id', 'profile.nickname'])
      .orderBy('post.id', 'DESC')
      .take(take)
      .skip(skip)
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .loadRelationCountAndMap('post.views', 'post.views');

    if (categoryName === EnumCategoryName.POPULAR) {
      qb.leftJoin('post.likes', 'likes')
        .groupBy('post.id')
        .having('COUNT(likes.id) > 5');
    }

    if (
      categoryName === EnumCategoryName.FREEBOARD ||
      categoryName === EnumCategoryName.INFORMATION ||
      categoryName === EnumCategoryName.ANNOUNCEMENT
    ) {
      qb.where('post.categoryName= :categoryName', { categoryName });
    } else {
      qb.where('post.categoryName IN (:...category)', {
        category: [EnumCategoryName.FREEBOARD, EnumCategoryName.INFORMATION],
      });
    }

    return await qb.getMany();
  }
  async findPagesCountByCategoryName(categoryName: EnumCategoryName) {
    const qb = this.repository
      .createQueryBuilder('post')
      .select('COUNT(*) AS postCount');

    if (categoryName === EnumCategoryName.POPULAR) {
      qb.leftJoin('post.likes', 'likes')
        .groupBy('post.id')
        .having('COUNT(likes.id) > 5');
    }

    if (
      categoryName === EnumCategoryName.FREEBOARD ||
      categoryName === EnumCategoryName.INFORMATION ||
      categoryName === EnumCategoryName.ANNOUNCEMENT
    ) {
      qb.where('post.categoryName= :categoryName', { categoryName });
    } else {
      qb.where('post.categoryName IN (:...category)', {
        category: [EnumCategoryName.FREEBOARD, EnumCategoryName.INFORMATION],
      });
    }

    return await qb.getCount();
  }
  async create(
    userId: number,
    createPostDto: CreatePostDto,
    queryRunner?: QueryRunner,
  ) {
    const { title, content, categoryName } = createPostDto;
    return await getConnection()
      .createQueryBuilder(queryRunner)
      .insert()
      .into(Post)
      .values({
        title,
        content,
        categoryName,
        userId,
      })
      .execute();
  }
  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    queryRunner?: QueryRunner,
  ) {
    const { title, content, categoryName } = updatePostDto;

    const qb = getConnection()
      .createQueryBuilder(queryRunner)
      .update(Post)
      .set({
        title,
        content,
        categoryName,
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
  isBaseCategory(categoryName: EnumCategoryName): boolean {
    return [
      EnumCategoryName.ANNOUNCEMENT,
      EnumCategoryName.FREEBOARD,
      EnumCategoryName.GENERAL,
    ].includes(categoryName);
  }
}
