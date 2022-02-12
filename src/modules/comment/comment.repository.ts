import { AbstractRepository, EntityRepository } from 'typeorm';
import { Comment } from 'src/entities/Comment';

@EntityRepository(Comment)
export class CommentRepository extends AbstractRepository<Comment> {}
