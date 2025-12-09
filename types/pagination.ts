/**
 * Pagination types for API responses
 */
export interface PaginationItem {
  active: boolean;
  href: string | null;
  text: string;
}

export interface PaginatedResult<T> {
  page?: number;
  pagination?: PaginationItem[];
  results: T[];
}
