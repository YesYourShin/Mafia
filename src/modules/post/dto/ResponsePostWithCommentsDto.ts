import { ApiProperty } from '@nestjs/swagger';
import { Comment, Post } from 'src/entities';

export class ResponsePostWithCommentsDto extends Post {
  @ApiProperty({ type: () => Comment })
  comments: Comment[];
}
