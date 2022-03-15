import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dto';
import { Comment } from 'src/entities';

class CommentDto extends OmitType(Comment, []) {}
export class ResponseCommentDto extends PickType(ResponseDto, [
  'success',
  'status',
  'data',
]) {
  @ApiProperty({ type: () => CommentDto })
  data: CommentDto;
}
