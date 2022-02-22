import { Post } from 'src/entities/Post';
import { Like } from 'src/entities/Like';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@EntityRepository(Post)
export class PostRepository extends AbstractRepository<Post> {
  async findOne(id: number) {
    const qb = await this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comment')
      .where('post.id = :id', { id })
      .getOne();

    return qb;
  }
  async findAll(categoryId: number, skip: number) {
    const qb = await this.repository
      .createQueryBuilder('post')
      .select('post.*')
      .addSelect('SUM(post.comments)', 'sum')
      .where('post.postCategoryId = :postCategoryId', {
        postCategoryId: categoryId,
      })
      .leftJoin('post.comments', 'comment')
      .groupBy('post.id')
      .take(10)
      .skip(skip)
      .getMany();

    return qb;
  }
  async findPagesCountByCategoryId(categoryId: number) {
    const qb = await this.repository
      .createQueryBuilder()
      .select('COUNT(id)')
      .where('postCategoryId = :postCategoryId', {
        postCategoryId: categoryId,
      })
      .getOne();
    return qb;
  }
  async create(userId: number, createPostDto: CreatePostDto) {
    const { title, content, postCategoryId } = createPostDto;
    return await this.repository
      .createQueryBuilder()
      .insert()
      .into(Post)
      .values({
        title,
        content,
        postCategoryId,
        userId,
      })
      .execute();
  }
  async update(id: number, updatePostDto: UpdatePostDto) {
    const { title, content, postCategoryId } = updatePostDto;

    const qb = this.repository
      .createQueryBuilder()
      .update(Post)
      .set({
        title,
        content,
        postCategoryId,
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
