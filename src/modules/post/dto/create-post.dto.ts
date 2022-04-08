import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { Post } from 'src/entities';

export class CreatePostDto extends PickType(Post, [
  'title',
  'content',
  'categoryId',
]) {
  @ApiProperty({
    description: '추가할 image id 배열',
    example: [1, 2, 3, 4],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  images?: number[];
}
