import { Post } from 'src/entities/Post';
import { AbstractRepository, EntityRepository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@EntityRepository(Post)
export class PostRepository extends AbstractRepository<Post> {
  async findOneById(id: number) {
    const qb = await this.repository
      .createQueryBuilder()
      .where('id = :id', { id })
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
}
