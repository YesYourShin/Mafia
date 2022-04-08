import { PickType } from '@nestjs/swagger';
import { Image } from 'src/entities';

export class ResponseImage extends PickType(Image, [
  'id',
  'originalname',
  'encoding',
  'mimetype',
  'size',
  'key',
  'location',
  'createdAt',
  'updatedAt',
]) {}
