import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreatePostDto, PostFindOneDto, UpdatePostDto } from './dto';
import { PostRepository } from './post.repository';
import { Pagination } from './paginate';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { ImageService } from '../image/image.service';
import { promiseAllSetteldResult } from 'src/shared/promise-all-settled-result';
import { InjectConnection } from '@nestjs/typeorm';
import { EnumCategoryName } from 'src/common/constants';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(Logger) private readonly logger = new Logger('PostService'),
    private readonly configService: ConfigService,
    private readonly imageService: ImageService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(userId: number, createPostDto: CreatePostDto) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const result = await this.postRepository.create(userId, createPostDto);
      const postId = result.identifiers[0].id;

      const { images } = createPostDto;
      if (images?.length) {
        await this.imageService.saveImagePost(postId, images, queryRunner);
      }

      await queryRunner.commitTransaction();
      return postId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Server error when create post');
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number, userId?: number): Promise<PostFindOneDto> {
    const { entities, raw } = await this.postRepository.findOne(id, userId);
    const post: PostFindOneDto = entities[0] as any;
    post.isLiked = raw[0].isLiked ? true : false;
    return post;
  }
  async findAll(categoryName: EnumCategoryName, page: number) {
    const takeItem = 10;
    const items = await this.postRepository.findAll(
      categoryName,
      (page - 1) * takeItem,
    );
    const totalItems = await this.postRepository.findPagesCountByCategoryName(
      categoryName,
    );
    const totalPages = Math.ceil(totalItems / takeItem);
    const itemCount = items.length;
    const temp = Math.floor(page / takeItem);
    const links = {};

    for (let i = 1; i <= 10; i++) {
      const tPage = i + temp * takeItem;
      if (tPage > totalPages) break;
      links[i] = `${this.configService.get(
        'FRONT_URL',
      )}/community/post?category=${categoryName}&page=${tPage}`;
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
    const { updateImages, removeImages } = updatePostDto;
    let keys: string[];

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      if (removeImages?.length) {
        //image location으로 image 검색
        const existImages = await this.imageService.findByLocation(
          removeImages,
        );

        //image id key 배열로 가져옴
        const { arrayOfId, arrayOfKey } =
          this.getIdAndKeyOutOfImages(existImages);
        keys = arrayOfKey;

        //image id 배열로 image 삭제
        await this.imageService.remove({
          id: arrayOfId,
        });
      }
      if (updateImages?.length) {
        // update images 다대다 테이블에 저장
        await this.imageService.saveImagePost(id, updateImages, queryRunner);
      }
      await this.postRepository.update(id, updatePostDto, queryRunner);

      if (keys?.length) {
        await this.imageService.deleteS3Objects(keys);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Server error when update post',
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }
  getIdAndKeyOutOfImages(images: { id: number; key: string }[]) {
    const arrayOfId = [];
    const arrayOfKey = [];
    for (const image of images) {
      arrayOfId.push(image.id);
      arrayOfKey.push(image.key);
    }
    return { arrayOfId, arrayOfKey };
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
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const images = await this.imageService.findByPostId(id);

      const keys = images.map((image) => image.key);

      const { value, reason } = await promiseAllSetteldResult([
        this.postRepository.remove(id),
        images.map((image) => this.imageService.remove({ id: image.id })),
      ]);
      await this.imageService.deleteS3Objects(keys);

      if (reason) {
        this.logger.error('Error when remove post', reason);
      }

      await queryRunner.commitTransaction();
      return { postId: id, delete: true };
    } catch (error) {
      this.logger.error(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('server error when remove post');
    } finally {
      await queryRunner.release();
    }
  }

  async removeImage(keys: string[]) {
    try {
      const deleteImages = this.imageService.deleteS3Objects(keys);
      const removeImages = keys.map((key) => this.imageService.remove({ key }));
      const { value, reason } = await promiseAllSetteldResult([
        deleteImages,
        removeImages,
      ]);

      if (reason?.length) {
        this.logger.error('Error when remove image', reason);
      }

      return { remove: true, keys };
    } catch (error) {
      this.logger.error(error);
    }
  }
}
