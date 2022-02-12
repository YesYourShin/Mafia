import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}
  async create(userId: number, createPostDto: CreatePostDto) {
    return this.postRepository.create(userId, createPostDto);
  }

  async findOne(id: number) {}
  async findAll(categoryId: number, skip: number) {}

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.findOneById(id);

    if (!post) {
      throw new NotFoundException('존재하지 않는 게시물입니다');
    }
    if (post.userId !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    await this.postRepository.update(id, updatePostDto);

    return await this.postRepository.findOneById(id);
  }

  async remove(id: number) {}
}
