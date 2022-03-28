import { AbstractRepository, EntityRepository } from 'typeorm';
import { Comment } from 'src/entities';
import { CreateCommentDto, UpdateCommentDto } from './dto';

@EntityRepository(Comment)
export class CommentRepository extends AbstractRepository<Comment> {
  async create(
    postId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const { content } = createCommentDto;
    return await this.repository
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values({
        content,
        postId,
        userId,
      })
      .execute();
  }
  async reply(
    postId: number,
    parentId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ) {
    const { content } = createCommentDto;
    return await this.repository
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values({
        content,
        postId,
        userId,
        parentId,
      })
      .execute();
  }
  async findOne(id: number) {
    return await this.repository
      .createQueryBuilder()
      .where('id = :id', { id })
      .getOne();
  }
  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const { content } = updateCommentDto;
    return await this.repository
      .createQueryBuilder()
      .update(Comment)
      .set({
        content,
      })
      .where('id = :id', { id })
      .execute();
  }

  async remove(id: number) {
    return await this.repository
      .createQueryBuilder()
      .delete()
      .from(Comment)
      .where('id = :id', { id })
      .execute();
  }
  async findAllByPostId(postId: number) {
    return await this.repository
      .createQueryBuilder('comment')
      .leftJoin('comment.profile', 'profile')
      .select(['comment.id', 'comment.content', 'comment.updatedAt'])
      .addSelect(['profile.id', 'profile.nickname'])
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentId IS NULL')
      .orderBy('comment.updatedAt')
      .loadRelationCountAndMap('comment.replyCount', 'comment.children')
      .getMany();
  }
}
