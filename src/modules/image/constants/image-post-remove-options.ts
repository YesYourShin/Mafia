import { IsInt, IsOptional } from 'class-validator';

export class ImagePostRemoveOptions {
  @IsInt()
  @IsOptional()
  readonly id?: number;

  @IsInt()
  @IsOptional()
  readonly postId?: string;

  @IsInt()
  @IsOptional()
  readonly imageId?: string;
}
