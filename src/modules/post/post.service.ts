import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto';
import { PostRepository } from './post.repository';
import { Pagination } from './paginate';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(Logger) private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: number, createPostDto: CreatePostDto) {
    const result = await this.postRepository.create(userId, createPostDto);
    return await this.findOne(result.identifiers[0].id);
  }

  async findOne(id: number) {
    return await this.postRepository.findOne(id);
  }
  async findAll(categoryId = 4, page = 1) {
    const items = await this.postRepository.findAll(
      categoryId,
      (page - 1) * 10,
    );
    const totalItems = await this.postRepository.findPagesCountByCategoryId(
      categoryId,
    );
    const totalPages = Math.ceil(totalItems / 10);
    const itemCount = items.length;
    const temp = Math.floor(page / 10);
    const links = {};

    for (let i = 1; i <= 10; i++) {
      const tPage = i + temp * 10;
      if (tPage > totalPages) break;
      links[i] = `${this.configService.get(
        'BACKEND_URL',
      )}/posts?category=${categoryId}&page=${tPage}`;
    }

    const data = new Pagination(
      items,
      {
        itemCount,
        totalItems,
        totalPages,
        currentPage: page,
      },
      links,
    );

    return data;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    await this.postRepository.update(id, updatePostDto);
    return await this.findOne(id);
  }

  async like(postId: number, userId: number) {
    const isLiked = await this.isLiked(postId, userId);
    if (isLiked) {
      throw new ForbiddenException('권한이 없습니다');
    }
    await this.postRepository.like(postId, userId);
    return { postId, like: true };
  }
  async unlike(postId: number, userId: number) {
    const isLiked = await this.isLiked(postId, userId);
    if (!isLiked) {
      throw new ForbiddenException('권한이 없습니다');
    }
    await this.postRepository.unlike(postId, userId);
    return { postId, unlike: true };
  }
  async isLiked(postId: number, userId: number) {
    return await this.postRepository.isLiked(postId, userId);
  }

  async remove(id: number) {
    await this.postRepository.remove(id);
    return { postId: id, delete: true };
  }
  async uploadImage(file: Express.Multer.File) {
    return file;
  }
}
