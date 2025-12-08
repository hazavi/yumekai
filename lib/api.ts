import { 
  PaginatedResult,
  BasicAnime,
  UpdatedAnime,
  SpotlightItem,
  TrendingItem,
  TopAnimeData,
  Genre,
  AnimeDetailsInfo,
  AnimeCardData,
  DailyScheduleResponse,
  DateScheduleResponse,
  WeeklyScheduleResponse
} from "@/models";

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_ANISCRAPER_API_URL || process.env.ANISCRAPER_API_URL;
  if (!url) {
    console.error('API URL not configured. Please set ANISCRAPER_API_URL or NEXT_PUBLIC_ANISCRAPER_API_URL in your environment variables.');
    return null;
  }
  return url;
};

export const BASE_URL = getApiUrl();

// Simple in-memory cache (client runtime) to avoid spamming API when components re-render
// Not used server-side persistently (clears on reload). Suitable for short-lived caching.
interface CacheEntry {
  expiry: number;
  data: unknown;
}
const memoryCache: Map<string, CacheEntry> = new Map();
// Track in-flight requests to de-duplicate parallel identical GETs
const inflight: Map<string, Promise<unknown>> = new Map();
const DEFAULT_TTL_MS = 60_000; // 60s

function getCacheKey(path: string, init?: RequestInit) {
  const method = init?.method || 'GET';
  return `${method}:${path}`;
}

interface FetchJSONOptions { retries?: number; once?: boolean; ttlMs?: number }

async function fetchJSON<T>(path: string, init?: RequestInit, ttlMs: number = DEFAULT_TTL_MS, options?: FetchJSONOptions): Promise<T> {
  const method = init?.method || 'GET';
  const isGet = method === 'GET' && (!init?.body);
  const key = getCacheKey(path, init);
  const retries = options?.retries ?? 2;
  if (options?.ttlMs) ttlMs = options.ttlMs;
  if (options?.once) ttlMs = 24 * 60 * 60 * 1000; // effectively "forever" for session

  if (isGet) {
    const cached = memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    } else if (cached) {
      memoryCache.delete(key); // stale
    }
  }
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Compose final URL
      let finalUrl: string;
      if (path.startsWith('http')) {
        // Absolute URL, use as-is
        finalUrl = path;
      } else if (path.startsWith('/api/')) {
        // Internal API route - need full URL for server-side requests
        if (typeof window === 'undefined') {
          // Server-side: construct full URL
          const vercelUrl = process.env.VERCEL_URL;
          const publicVercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
          
          // Debug logging for environment detection
          if (path.includes('schedule')) {
            console.log('Environment check:', { 
              nodeEnv: process.env.NODE_ENV, 
              vercelUrl, 
              publicVercelUrl 
            });
          }
          
          // Always use HTTP for localhost in development
          if (!vercelUrl && !publicVercelUrl) {
            finalUrl = `http://localhost:3000${path}`;
          } else if (process.env.NODE_ENV === 'production' && (vercelUrl || publicVercelUrl)) {
            const protocol = 'https';
            const host = vercelUrl || publicVercelUrl;
            finalUrl = `${protocol}://${host}${path}`;
          } else {
            // Fallback to HTTP localhost
            finalUrl = `http://localhost:3000${path}`;
          }
        } else {
          // Client-side: relative path is fine
          finalUrl = path;
        }
      } else {
        // External API path
        if (!BASE_URL) {
          throw new Error('API configuration missing');
        }
        finalUrl = `${BASE_URL}${path}`;
      }
      
      // Debug logging
      if (path.includes('schedule')) {
        console.log('Fetching schedule from:', finalUrl);
      }

      // Inflight reuse (only for GET)
      if (isGet) {
        const inflightKey = `inflight:${finalUrl}`;
        if (inflight.has(inflightKey)) {
          return inflight.get(inflightKey) as Promise<T>;
        }
        const p = (async () => {
          const res = await fetch(finalUrl, {
            next: { revalidate: 60 },
            ...init,
            headers: {
              ...(init?.headers || {}),
              Accept: "application/json",
            },
          });
          if (!res.ok) {
            throw new Error(`API ${path} failed: ${res.status}`);
          }
          return res.json() as Promise<T>;
        })();
        inflight.set(inflightKey, p);
        try {
          const json = await p;
          if (isGet) {
            memoryCache.set(key, { data: json, expiry: Date.now() + ttlMs });
          }
          return json;
        } catch (err) {
          inflight.delete(inflightKey);
          throw err;
        } finally {
          inflight.delete(inflightKey);
        }
      }

      const res = await fetch(finalUrl, {
        next: { revalidate: 60 },
        ...init,
        headers: {
          ...(init?.headers || {}),
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        lastError = new Error(`API ${path} failed: ${res.status}`);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 150 * Math.pow(2, attempt))); // backoff
          continue;
        }
        throw lastError;
      }
      const json = await res.json() as T;
      if (isGet) {
        memoryCache.set(key, { data: json, expiry: Date.now() + ttlMs });
      }
      return json;
    } catch (e: unknown) {
      lastError = e instanceof Error ? e : new Error(String(e));
      // Debug logging for schedule errors
      if (path.includes('schedule')) {
        console.error(`Schedule API error (attempt ${attempt + 1}):`, e);
      }
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 150 * Math.pow(2, attempt)));
        continue;
      }
    }
  }

  // Fallback: if we have stale data return it instead of hard failing
  const stale = memoryCache.get(key);
  if (stale) {
    return stale.data as T;
  }
  throw lastError || new Error(`API ${path} failed`);
}

export const api = {
  spotlightSlider: async () => {
    const data = await fetchJSON<unknown>(`/spotlight-slider`);
    
    if (Array.isArray(data)) {
      return data as SpotlightItem[];
    }
    if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results: unknown }).results)) {
      const results = (data as { results: SpotlightItem[] }).results;
      return results;
    }
    return [];
  },
  trending: () => fetchJSON<TrendingItem[]>(`/trending`, undefined, undefined, { once: true }),
  recentlyUpdated: (page = 1) => fetchJSON<PaginatedResult<UpdatedAnime>>(`/recently-updated?page=${page}`), // changes frequently
  recentlyAdded: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/recently-added?page=${page}`), // dynamic
  topUpcoming: () => fetchJSON<{ results: BasicAnime[] }>(`/top-upcoming`, undefined, undefined, { once: true }),
  topAiring: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/top-airing?page=${page}`),
  mostPopular: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/most-popular?page=${page}`),
  mostFavorite: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/most-favorite?page=${page}`),
  completed: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/completed?page=${page}`),
  topAnime: () => fetchJSON<TopAnimeData>(`/top-anime`, undefined, undefined, { once: true }),
  genres: () => fetchJSON<{ genres: Genre[] }>(`/genres`, undefined, undefined, { once: true }),
  genreAnime: (genre: string, page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/genre/${encodeURIComponent(genre)}?page=${page}`),
  tv: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/tv?page=${page}`),
  movie: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/movie?page=${page}`),
  ova: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/ova?page=${page}`),
  ona: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/ona?page=${page}`),
  special: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/special?page=${page}`),
  details: (slug: string) => fetchJSON<AnimeDetailsInfo>(`${slug.startsWith('/') ? '' : '/'}${slug}`),
  watch: (slug: string, ep?: string) => {
    const query = ep ? `?ep=${encodeURIComponent(ep)}` : '';
    // Use internal proxy route on client to bypass CORS; server side can still call external
    const internal = `/api/watch/${slug}${query}`;
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
    }>(internal, undefined, 15_000, { retries: 3 });
  },
  schedule: (date?: string) => {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return fetchJSON<DailyScheduleResponse | DateScheduleResponse>(`/api/schedule${query}`);
  },
  scheduleWeek: () => fetchJSON<WeeklyScheduleResponse>(`/api/schedule/week`),
  search: (query: string) => fetchJSON<{ results: BasicAnime[] }>(`/api/search?keyword=${encodeURIComponent(query)}`),
};

export type { AnimeCardData };
