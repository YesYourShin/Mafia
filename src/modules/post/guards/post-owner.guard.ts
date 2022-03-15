import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserProfile } from 'src/modules/user/dto';
import { PostRepository } from '../post.repository';

@Injectable()
export class PostOwnerGuard implements CanActivate {
  constructor(private readonly postRepository: PostRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { postId } = request.params;

    const post = await this.postRepository.existPost(postId);

    const { profile } = request.user as UserProfile;
    const { userId } = profile;

    if (post.userId !== userId) {
      throw new ForbiddenException('권한이 없습니다');
    }

    return true;
  }
}
