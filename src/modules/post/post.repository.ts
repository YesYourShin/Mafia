import { Post } from 'src/entities/Post';
import { Like } from 'src/entities/Like';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ICategory } from 'src/common/constants';

@EntityRepository(Post)
export class PostRepository extends AbstractRepository<Post> {
  async existPost(id: number) {
    return await this.repository
      .createQueryBuilder('post')
      .where('id = :id', { id })
      .getOne();
  }
  async findOne(id: number) {
    return this.repository
      .createQueryBuilder('post')
      .leftJoin('post.profile', 'postProfile')
      .leftJoin('post.comments', 'comment')
      .leftJoin('comment.profile', 'commentProfile')
      .select(['post.id', 'post.title', 'post.content', 'post.updatedAt'])
      .addSelect(['postProfile.id', 'postProfile.nickname'])
      .addSelect(['comment.id', 'comment.content', 'comment.updatedAt'])
      .addSelect(['commentProfile.id', 'commentProfile.nickname'])
      .orderBy('comment.updatedAt')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .loadRelationCountAndMap('comment.replyCount', 'comment.children')
      .where('post.id = :id', { id })
      .andWhere('comment.parentId IS NULL')
      .getOne();
  }
  async findAll(categoryId: number, skip: number) {
    console.log('skip', skip);
    const qb = this.repository
      .createQueryBuilder('post')
      .leftJoin('post.profile', 'profile')
      .select(['post.id', 'post.title', 'post.updatedAt', 'post.categoryId'])
      .addSelect(['profile.id', 'profile.nickname'])
      .orderBy('post.id', 'DESC')
      .take(10)
      .skip(skip)
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .loadRelationCountAndMap('post.views', 'post.views');

    if (
      categoryId === ICategory.ANNOUNCEMENT ||
      categoryId === ICategory.FREEBOARD ||
      categoryId === ICategory.INFORMATIN
    ) {
      qb.where('post.categoryId = :categoryId', { categoryId });
    } else if (categoryId === ICategory.GENERAL) {
      qb.where('post.categoryId IN (:...categoryId)', {
        categoryId: [2, 3],
      });
    } else if (categoryId === ICategory.POPULAR) {
      qb.where('post.categoryId IN (:...categoryId)', {
        categoryId: [2, 3],
      })
        .leftJoin('post.likes', 'likes')
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
      categoryId === ICategory.ANNOUNCEMENT ||
      categoryId === ICategory.FREEBOARD ||
      categoryId === ICategory.INFORMATIN
    ) {
      qb.where('post.categoryId = :categoryId', { categoryId });
    } else if (categoryId === ICategory.GENERAL) {
      qb.where('post.categoryId IN (:...categoryId)', {
        categoryId: [2, 3],
      });
    } else if (categoryId === ICategory.POPULAR) {
      qb.where('post.categoryId IN (:...categoryId)', {
        categoryId: [2, 3],
      })
        .leftJoin('post.likes', 'likes')
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
  async update(id: number, updatePostDto: UpdatePostDto) {
    const { title, content, categoryId } = updatePostDto;

    const qb = this.repository
      .createQueryBuilder()
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
    const qb = this.createQueryBuilder('like')
      .select()
      .from(Like, 'like')
      .where('like.postId = :postId', { postId })
      .andWhere('like.userId = :userId', { userId })
      .getOne();

    return qb;
  }
  async like(postId: number, userId: number) {
    const qb = this.createQueryBuilder('like')
      .insert()
      .into(Like)
      .values({ postId, userId })
      .execute();
    return qb;
  }
  async unlike(postId: number, userId: number) {
    const qb = this.createQueryBuilder('like')
      .delete()
      .from(Like)
      .where('postId = :postId', { postId })
      .andWhere('userId = :userId', { userId })
      .execute();

    return qb;
  }
  async remove(id) {
    const qb = this.repository
      .createQueryBuilder()
      .delete()
      .from(Post)
      .where('id = :id', { id })
      .execute();
    return qb;
  }
}
