import { PickType } from '@nestjs/swagger';
import { Comment } from 'src/entities';

export class UpdateCommentDto extends PickType(Comment, ['content']) {}
