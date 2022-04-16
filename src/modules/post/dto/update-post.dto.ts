import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { Post } from 'src/entities';

export class UpdatePostDto extends PickType(Post, [
  'title',
  'content',
  'categoryName',
]) {
  @ApiProperty({ description: '추가할 image id 배열', example: [1, 2, 3, 4] })
  @IsOptional()
  @IsArray()
  updateImages?: number[];

  @ApiProperty({
    description: '삭제할 image src 배열',
    example: ['http://aa.x/cat.jpg', 'http://aa.x/cat2.jpg'],
  })
  @IsOptional()
  @IsArray()
  removeImages?: string[];
}
