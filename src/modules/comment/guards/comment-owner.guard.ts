import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RequestUser } from 'src/common/constants/request-user';
import { CommentRepository } from '../comment.repository';

@Injectable()
export class CommentOwnerGuard implements CanActivate {
  constructor(private readonly commentRepository: CommentRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();
    const { id } = request.params;

    const comment = await this.commentRepository.findOne(+id);

    const { userId } = request.user.profile;

    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('권한이 없습니다');
    }

    return true;
  }
}
