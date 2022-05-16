export interface ObjectLiteral {
  [s: string]: any;
}

export interface IPaginationMeta extends ObjectLiteral {
  /**
   * 현재 페이지의 총 항목 수
   */
  itemCount: number;
  /**
   * 전체 항목의 수
   */
  totalItems?: number;
  /**
   * 10개씩 가져올 때 전체 페이지 수
   */
  totalPages?: number;
  /**
   * 현재 페이지
   */
  currentPage: number;
}

export interface IPaginationLinks {
  current?: string;
  next?: string;
}
