import { IPaginationMeta, ObjectLiteral } from '.';
import { IPaginationLinks } from './constants';

export class Pagination<
  PaginationObject,
  T extends ObjectLiteral = IPaginationMeta,
> {
  constructor(
    public readonly items: PaginationObject[],
    public readonly meta: T,
    public readonly links?: IPaginationLinks | T,
  ) {}
}
