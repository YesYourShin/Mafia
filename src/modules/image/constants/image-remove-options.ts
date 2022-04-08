import { IsInt, IsOptional, IsString } from 'class-validator';

export class ImageRemoveOptions {
  @IsInt()
  @IsOptional()
  readonly id?: number | number[];

  @IsString()
  @IsOptional()
  readonly key?: string | string[];

  @IsString()
  @IsOptional()
  readonly location?: string | string[];
}
