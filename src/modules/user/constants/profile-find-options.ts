import { IsInt, IsOptional } from 'class-validator';

export class ProfileFindOneOptions {
  @IsInt()
  @IsOptional()
  readonly id?: number;

  @IsInt()
  @IsOptional()
  readonly userId?: number;
}
