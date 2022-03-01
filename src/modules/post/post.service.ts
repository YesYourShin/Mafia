import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDto } from 'src/common/dto';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(Logger) private readonly logger: Logger,
  ) {}

  async create(userId: number, createPostDto: CreatePostDto) {
    const qb = await this.postRepository.create(userId, createPostDto);
    return await this.postRepository.findOne(qb.identifiers[0].id);
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne(id);
    if (post) {
      throw new NotFoundException('존재하지 않는 게시물입니다');
    }
    return post;
  }
  async findAll(categoryId = 1, page = 1) {
    this.logger.log(page);
    const posts = await this.postRepository.findAll(categoryId, page * 10);
    const pages = await this.postRepository.findPagesCountByCategoryId(
      categoryId,
    );
    return new ResponseDto(true, 200, { ...posts, ...pages });
  }

  async update(id: number, userId: number, updatePostDto: UpdatePostDto) {
    const post = await this.postRepository.findOne(id);

    if (post.userId !== userId) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    await this.postRepository.update(id, updatePostDto);

    return await this.postRepository.findOne(id);
  }

  async like(postId: number, userId: number) {
    const isLiked = await this.isLiked(postId, userId);
    if (isLiked) {
      throw new ForbiddenException('권한이 없습니다');
    }
    return await this.postRepository.like(postId, userId);
  }
  async unlike(postId: number, userId: number) {
    const isLiked = await this.isLiked(postId, userId);
    if (!isLiked) {
      throw new ForbiddenException('권한이 없습니다');
    }
    return await this.postRepository.unlike(postId, userId);
  }
  async isLiked(postId: number, userId: number) {
    await this.findOne(postId);
    return await this.postRepository.isLiked(postId, userId);
  }

  async remove(id: number, userId: number) {
    const post = await this.findOne(id);

    if (post.userId !== userId) {
      throw new ForbiddenException('권한이 없습니다');
    }
    return await this.postRepository.remove(id);
  }
  async uploadImage(file: Express.Multer.File) {
    return file;
  }
}
