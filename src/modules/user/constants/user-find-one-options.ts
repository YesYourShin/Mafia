import { IsInt, IsOptional, IsString } from 'class-validator';

export class UserFindOneOptions {
  @IsInt()
  @IsOptional()
  readonly id?: number;

  @IsString()
  @IsOptional()
  readonly socialId?: string;

  @IsString()
  @IsOptional()
  readonly provider?: string;
}
