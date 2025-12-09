/**
 * API-related types
 */

export interface CacheEntry {
  expiry: number;
  data: unknown;
}

export interface FetchJSONOptions {
  retries?: number;
  once?: boolean;
  ttlMs?: number;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * Search result response
 */
export interface SearchResponse {
  results: Array<{
    title: string;
    thumbnail: string;
    link: string;
    type: string;
  }>;
  page?: number;
  hasNextPage?: boolean;
}
