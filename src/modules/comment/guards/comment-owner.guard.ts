import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserProfile } from 'src/modules/user/dto';
import { CommentRepository } from '../comment.repository';

@Injectable()
export class CommentOwnerGuard implements CanActivate {
  constructor(private readonly commentRepository: CommentRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { id } = request.params;

    const comment = await this.commentRepository.findOne(id);

    const { profile } = request.user as UserProfile;
    const { userId } = profile;

    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('권한이 없습니다');
    }

    return true;
  }
}
