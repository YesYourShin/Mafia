import { PickType } from '@nestjs/swagger';
import { Comment } from 'src/entities';

export class CreateCommentDto extends PickType(Comment, ['content']) {}
