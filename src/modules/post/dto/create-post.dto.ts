import { PickType } from '@nestjs/swagger';
import { Post } from 'src/entities/Post';

export class CreatePostDto extends PickType(Post, [
  'title',
  'content',
  'postCategoryId',
]) {}
