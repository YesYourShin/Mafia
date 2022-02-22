import { ApiProperty } from '@nestjs/swagger';
import { Comment } from 'src/entities/Comment';
import { Post } from 'src/entities/Post';

export class ResponsePostWithCommentsDto extends Post {
  @ApiProperty({ type: () => Comment })
  comments: Comment[];
}
