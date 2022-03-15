import { IPaginationMeta, ObjectLiteral } from '.';

export class Pagination<
  PaginationObject,
  T extends ObjectLiteral = IPaginationMeta,
> {
  constructor(
    public readonly items: PaginationObject[],
    public readonly meta: T,
    public readonly links?: T,
  ) {}
}
