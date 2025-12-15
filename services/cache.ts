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
 * Maximum cache size to prevent memory leaks
 */
const MAX_CACHE_SIZE = 500;

/**
 * Default cache TTL in milliseconds (60 seconds)
 */
export const DEFAULT_TTL_MS = 60_000;

/**
 * Extended TTL for static/rarely changing data (5 minutes)
 */
export const STATIC_TTL_MS = 300_000;

/**
 * Long TTL for data that changes daily (1 hour)
 */
export const LONG_TTL_MS = 3600_000;

/**
 * Gets a cache key for a request
 */
export function getCacheKey(path: string, init?: RequestInit): string {
  const method = init?.method || 'GET';
  // Normalize path to avoid duplicate cache entries
  const normalizedPath = path.replace(/\/+/g, '/').toLowerCase();
  return `${method}:${normalizedPath}`;
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
 * Gets stale cached data (expired but still available)
 */
export function getStaleFromCache<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (cached) {
    return cached.data as T;
  }
  return null;
}

/**
 * Sets data in cache with expiry
 */
export function setInCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  // Evict oldest entries if cache is full
  if (memoryCache.size >= MAX_CACHE_SIZE) {
    evictOldestEntries(Math.floor(MAX_CACHE_SIZE * 0.2)); // Evict 20%
  }
  
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
}

/**
 * Evicts the oldest cache entries
 */
function evictOldestEntries(count: number): void {
  const entries = Array.from(memoryCache.entries());
  // Sort by expiry (oldest first)
  entries.sort((a, b) => a[1].expiry - b[1].expiry);
  
  for (let i = 0; i < Math.min(count, entries.length); i++) {
    memoryCache.delete(entries[i][0]);
  }
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

/**
 * Gets cache statistics for debugging
 */
export function getCacheStats(): { size: number; maxSize: number; inflightCount: number } {
  return {
    size: memoryCache.size,
    maxSize: MAX_CACHE_SIZE,
    inflightCount: inflight.size
  };
}
