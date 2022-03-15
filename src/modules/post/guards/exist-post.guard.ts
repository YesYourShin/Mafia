import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from 'src/modules/post/post.repository';

@Injectable()
export class ExistPostGuard implements CanActivate {
  constructor(private readonly postRepository: PostRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { postId } = request.params;

    const post = await this.postRepository.existPost(+postId);
    if (!post) {
      throw new NotFoundException('존재하지 않는 게시물입니다');
    }

    return true;
  }
}
