import type { CacheEntry } from '@/types';

/**
 * Simple in-memory cache for API responses
 * Not used server-side persistently (clears on reload)
 */
const memoryCache: Map<string, CacheEntry> = new Map();

/**
 * Track in-flight requests to de-duplicate parallel identical GETs
 */
const inflight: Map<string, Promise<unknown>> = new Map();

/**
 * Default cache TTL in milliseconds (60 seconds)
 */
export const DEFAULT_TTL_MS = 60_000;

/**
 * Gets a cache key for a request
 */
export function getCacheKey(path: string, init?: RequestInit): string {
  const method = init?.method || 'GET';
  return `${method}:${path}`;
}

/**
 * Gets cached data if available and not expired
 */
export function getFromCache<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  if (cached) {
    memoryCache.delete(key); // Remove stale entry
  }
  return null;
}

/**
 * Sets data in cache with expiry
 */
export function setInCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
}

/**
 * Gets an inflight request promise if one exists
 */
export function getInflight<T>(key: string): Promise<T> | null {
  return inflight.get(key) as Promise<T> | null;
}

/**
 * Sets an inflight request promise
 */
export function setInflight<T>(key: string, promise: Promise<T>): void {
  inflight.set(key, promise);
}

/**
 * Removes an inflight request
 */
export function removeInflight(key: string): void {
  inflight.delete(key);
}

/**
 * Clears all cache entries
 */
export function clearCache(): void {
  memoryCache.clear();
}

/**
 * Clears expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiry <= now) {
      memoryCache.delete(key);
    }
  }
}
