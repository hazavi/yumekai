export interface PaginatedResult<T> {
  page?: number;
  pagination?: { active: boolean; href: string; text: string }[];
  results: T[];
}
