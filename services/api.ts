import type {
  PaginatedResult,
  BasicAnime,
  UpdatedAnime,
  SpotlightItem,
  TrendingItem,
  TopAnimeData,
  Genre,
  AnimeDetailsInfo,
  DailyScheduleResponse,
  DateScheduleResponse,
  WeeklyScheduleResponse,
  FetchJSONOptions
} from '@/types';
import {
  getCacheKey,
  getFromCache,
  getStaleFromCache,
  setInCache,
  getInflight,
  setInflight,
  removeInflight,
  DEFAULT_TTL_MS,
  STATIC_TTL_MS,
  LONG_TTL_MS
} from './cache';

/**
 * Gets the API base URL from environment variables
 */
const getApiUrl = (): string | null => {
  const url = process.env.NEXT_PUBLIC_ANISCRAPER_API_URL || process.env.ANISCRAPER_API_URL;
  if (!url) {
    console.error('API URL not configured. Please set ANISCRAPER_API_URL or NEXT_PUBLIC_ANISCRAPER_API_URL in your environment variables.');
    return null;
  }
  return url;
};

export const BASE_URL = getApiUrl();

/**
 * Builds the final URL for a request
 */
function buildUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }

  if (path.startsWith('/api/')) {
    if (typeof window === 'undefined') {
      const vercelUrl = process.env.VERCEL_URL;
      const publicVercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

      if (!vercelUrl && !publicVercelUrl) {
        return `http://localhost:3000${path}`;
      }

      if (process.env.NODE_ENV === 'production' && (vercelUrl || publicVercelUrl)) {
        const host = vercelUrl || publicVercelUrl;
        return `https://${host}${path}`;
      }

      return `http://localhost:3000${path}`;
    }
    return path;
  }

  if (!BASE_URL) {
    throw new Error('API configuration missing');
  }
  return `${BASE_URL}${path}`;
}

/**
 * Core fetch function with caching, retries, and deduplication
 * Optimized with stale-while-revalidate pattern
 */
async function fetchJSON<T>(
  path: string,
  init?: RequestInit,
  ttlMs: number = DEFAULT_TTL_MS,
  options?: FetchJSONOptions
): Promise<T> {
  const method = init?.method || 'GET';
  const isGet = method === 'GET' && !init?.body;
  const key = getCacheKey(path, init);
  const retries = options?.retries ?? 1; // Reduced default retries for faster failures
  
  if (options?.ttlMs) ttlMs = options.ttlMs;
  if (options?.once) ttlMs = 24 * 60 * 60 * 1000; // 24 hours for "once" requests

  // Check cache for GET requests
  if (isGet) {
    const cached = getFromCache<T>(key);
    if (cached) return cached;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const finalUrl = buildUrl(path);

      // Inflight reuse for GET requests
      if (isGet) {
        const inflightKey = `inflight:${finalUrl}`;
        const existing = getInflight<T>(inflightKey);
        if (existing) return existing;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const promise = (async () => {
          try {
            const res = await fetch(finalUrl, {
              next: { revalidate: 60 },
              signal: controller.signal,
              ...init,
              headers: {
                ...(init?.headers || {}),
                Accept: 'application/json',
              },
            });

            if (!res.ok) {
              throw new Error(`API ${path} failed: ${res.status}`);
            }

            return res.json() as Promise<T>;
          } finally {
            clearTimeout(timeoutId);
          }
        })();

        setInflight(inflightKey, promise);

        try {
          const json = await promise;
          setInCache(key, json, ttlMs);
          return json;
        } finally {
          removeInflight(inflightKey);
        }
      }

      // Non-GET requests with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const res = await fetch(buildUrl(path), {
          next: { revalidate: 60 },
          signal: controller.signal,
          ...init,
          headers: {
            ...(init?.headers || {}),
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          lastError = new Error(`API ${path} failed: ${res.status}`);
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt))); // Faster retry
            continue;
          }
          throw lastError;
        }

        const json = await res.json() as T;
        if (isGet) {
          setInCache(key, json, ttlMs);
        }
        return json;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (e: unknown) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt))); // Faster retry
        continue;
      }
    }
  }

  // Return stale data if available (stale-while-revalidate pattern)
  const stale = getStaleFromCache<T>(key);
  if (stale) return stale;

  throw lastError || new Error(`API ${path} failed`);
}

/**
 * API service with all available endpoints
 * Optimized with appropriate TTLs for each data type
 */
export const api = {
  // Spotlight/Featured - changes frequently, short TTL
  spotlightSlider: async (): Promise<SpotlightItem[]> => {
    const data = await fetchJSON<unknown>('/spotlight-slider', undefined, STATIC_TTL_MS);
    
    if (Array.isArray(data)) {
      return data as SpotlightItem[];
    }
    if (data && typeof data === 'object' && 'results' in data) {
      return (data as { results: SpotlightItem[] }).results;
    }
    return [];
  },

  // Trending - changes infrequently, longer TTL
  trending: () => fetchJSON<TrendingItem[]>('/trending', undefined, LONG_TTL_MS, { once: true }),

  // Recently Updated/Added - changes frequently
  recentlyUpdated: (page = 1) => 
    fetchJSON<PaginatedResult<UpdatedAnime>>(`/recently-updated?page=${page}`, undefined, DEFAULT_TTL_MS),
  recentlyAdded: (page = 1) => 
    fetchJSON<PaginatedResult<BasicAnime>>(`/recently-added?page=${page}`, undefined, DEFAULT_TTL_MS),

  // Top Lists - relatively static data, use longer TTL
  topUpcoming: () => 
    fetchJSON<{ results: BasicAnime[] }>('/top-upcoming', undefined, LONG_TTL_MS, { once: true }),
  topAiring: (page = 1) => 
    fetchJSON<PaginatedResult<BasicAnime>>(`/top-airing?page=${page}`, undefined, STATIC_TTL_MS),
  mostPopular: (page = 1) => 
    fetchJSON<PaginatedResult<BasicAnime>>(`/most-popular?page=${page}`, undefined, STATIC_TTL_MS),
  mostFavorite: (page = 1) => 
    fetchJSON<PaginatedResult<BasicAnime>>(`/most-favorite?page=${page}`, undefined, STATIC_TTL_MS),
  completed: (page = 1) => 
    fetchJSON<PaginatedResult<BasicAnime>>(`/completed?page=${page}`, undefined, STATIC_TTL_MS),
  topAnime: () => 
    fetchJSON<TopAnimeData>('/top-anime', undefined, LONG_TTL_MS, { once: true }),

  // Genres - very static, long TTL
  genres: () => 
    fetchJSON<{ genres: Genre[] }>('/genres', undefined, LONG_TTL_MS, { once: true }),
  genreAnime: (genre: string, page = 1) => 
    fetchJSON<PaginatedResult<BasicAnime>>(`/genre/${encodeURIComponent(genre)}?page=${page}`, undefined, STATIC_TTL_MS),

  // Type-based listings - moderate TTL
  tv: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/tv?page=${page}`, undefined, STATIC_TTL_MS),
  movie: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/movie?page=${page}`, undefined, STATIC_TTL_MS),
  ova: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/ova?page=${page}`, undefined, STATIC_TTL_MS),
  ona: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/ona?page=${page}`, undefined, STATIC_TTL_MS),
  special: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/special?page=${page}`, undefined, STATIC_TTL_MS),

  // Details - moderate TTL as anime details don't change often
  details: (slug: string) => 
    fetchJSON<AnimeDetailsInfo>(`${slug.startsWith('/') ? '' : '/'}${slug}`, undefined, STATIC_TTL_MS),

  // Watch
  watch: (slug: string, ep?: string) => {
    const query = ep ? `?ep=${encodeURIComponent(ep)}` : '';
    return fetchJSON<{
      episodes: Array<{
        episode_nr: number;
        id: string;
        jname: string;
        real_id: string;
        servers: {
          dub: Array<{
            data_id: string;
            default: boolean;
            ifram_src: string;
            name: string;
            server_id: string;
          }>;
          sub: Array<{
            data_id: string;
            default: boolean;
            ifram_src: string;
            name: string;
            server_id: string;
          }>;
        };
        title: string;
      }>;
      recommendations: Array<{
        jname: string;
        poster: string;
        qtip: {
          aired: string;
          description: string;
          dub: string | null;
          eps: string;
          genres: string[];
          japanese: string;
          quality: string;
          rating: string;
          status: string;
          sub: string;
          synonyms: string | null;
          title: string;
          type: string;
          watch_url: string;
        };
        title: string;
        url: string;
      }>;
      total_episodes: number;
      watch_detail: {
        content_rating: string;
        description: string;
        duration: string;
        jname: string;
        poster: string;
        producers: string[];
        quality: string;
        rating: string | null;
        sub_count: string;
        title: string;
        type: string;
      };
    }>(`/api/watch/${slug}${query}`, undefined, 15_000, { retries: 3 });
  },

  // Schedule
  schedule: (date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return fetchJSON<DailyScheduleResponse | DateScheduleResponse>(`/api/schedule${query}`);
  },
  scheduleWeek: () => 
    fetchJSON<WeeklyScheduleResponse>('/api/schedule/week'),

  // Search
  search: (query: string) => 
    fetchJSON<{ results: BasicAnime[] }>(`/api/search?keyword=${encodeURIComponent(query)}`),
};
