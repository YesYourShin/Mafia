import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { RequestUser } from 'src/common/constants/request-user';
import { PostRepository } from '../post.repository';

@Injectable()
export class PostOwnerGuard implements CanActivate {
  constructor(private readonly postRepository: PostRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestUser = context.switchToHttp().getRequest();
    const { postId } = request.params;

    const post = await this.postRepository.existPost(+postId);

    const { userId } = request.user.profile;

    if (post.userId !== userId) {
      throw new ForbiddenException('권한이 없습니다');
    }

    return true;
  }
}
