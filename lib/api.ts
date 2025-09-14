import { 
  QtipData,
  PaginatedResult,
  BasicAnime,
  UpdatedAnime,
  SpotlightItem,
  TrendingItem,
  TopAnimeData,
  Genre,
  AnimeDetailsInfo,
  AnimeCardData
} from "@/models";

const BASE_URL = "https://aniscraper-eta.vercel.app";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
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
}

export const api = {
  spotlightSlider: async () => {
    const data = await fetchJSON<any>(`/spotlight-slider`);
    if (Array.isArray(data)) return data as SpotlightItem[]; // fallback if direct array
    if (data && Array.isArray(data.results)) return data.results as SpotlightItem[];
    return [];
  },
  trending: () => fetchJSON<TrendingItem[]>(`/trending`),
  recentlyUpdated: (page = 1) => fetchJSON<PaginatedResult<UpdatedAnime>>(`/recently-updated?page=${page}`),
  recentlyAdded: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/recently-added?page=${page}`),
  topUpcoming: () => fetchJSON<{ results: BasicAnime[] }>(`/top-upcoming`),
  topAiring: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/top-airing?page=${page}`),
  mostPopular: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/most-popular?page=${page}`),
  mostFavorite: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/most-favorite?page=${page}`),
  completed: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/completed?page=${page}`),
  topAnime: () => fetchJSON<TopAnimeData>(`/top-anime`),
  genres: () => fetchJSON<{ genres: Genre[] }>(`/genres`),
  genreAnime: (genre: string, page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/genre/${encodeURIComponent(genre)}?page=${page}`),
  tv: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/tv?page=${page}`),
  movie: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/movie?page=${page}`),
  ova: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/ova?page=${page}`),
  ona: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/ona?page=${page}`),
  special: (page = 1) => fetchJSON<PaginatedResult<BasicAnime>>(`/special?page=${page}`),
  details: (slug: string) => fetchJSON<AnimeDetailsInfo>(`${slug.startsWith('/') ? '' : '/'}${slug}`),
};

export type { AnimeCardData };
