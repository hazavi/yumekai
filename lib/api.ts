const BASE_URL = "https://aniscraper-eta.vercel.app";

export interface QtipData {
  aired?: string;
  description?: string;
  dub?: string;
  eps?: string | null;
  genres?: string[];
  japanese?: string;
  quality?: string;
  rating?: string;
  status?: string;
  sub?: string;
  synonyms?: string;
  title?: string;
  type?: string;
  watch_url?: string;
}

export interface PaginatedResult<T> {
  page?: number;
  pagination?: { active: boolean; href: string; text: string }[];
  results: T[];
}

export interface BasicAnime {
  link: string; // slug like "/one-piece"
  thumbnail: string;
  title: string;
  type: string; // TV, Movie, etc.
  qtip?: QtipData;
}

export interface UpdatedAnime extends BasicAnime {
  description?: string;
  dub?: string; // SUB / DUB
  duration?: string; // e.g. 24m
  latest_episode?: string; // e.g. EP 1100
  qtip?: QtipData;
}

export interface SpotlightItem {
  date?: string;
  description?: string;
  detail_link: string; // slug for details
  dub_ep?: string;
  duration?: string;
  eps?: string | null;
  quality?: string;
  spotlight?: string; // "#1 Spotlight" etc
  sub_ep?: string;
  thumbnail: string;
  title: string;
  type: string;
  watch_link: string; // /watch/slug
  qtip?: QtipData;
}
export type TrendingItem = {
  jname: string;
  poster: string;
  qtip?: QtipData;
  rank: string;
  title: string;
  url: string;
};

export interface TopAnimeGroups {
  today: BasicAnime[];
  week: BasicAnime[];
  month: BasicAnime[];
}

export interface TopAnimeData {
  top_today: (BasicAnime & { rank: string })[];
  top_week: (BasicAnime & { rank: string })[];
  top_month: (BasicAnime & { rank: string })[];
}

export interface Genre {
  name: string;
  slug: string;
  url: string;
}

export interface AnimeDetailsInfo {
  description: string;
  genres: string[];
  info: Record<string, string | string[]>;
  link: string;
  quality: string;
  sub_count: string; // SUB
  thumbnail: string;
  title: string;
  watch_link: string; // /watch/slug
  recommendations?: BasicAnime[];
  qtip?: QtipData;
}

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
  details: (slug: string) => fetchJSON<AnimeDetailsInfo>(`${slug.startsWith('/') ? '' : '/'}${slug}`),
};

export type { BasicAnime as AnimeCardData };
