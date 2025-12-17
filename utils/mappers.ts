import type { AnimeDetailsInfo, QtipData, PaginatedResult, BasicAnime } from '@/types';

/**
 * Shape consumed by AnimeInfoPage component
 */
export interface AnimeInfoMapped {
  title: string;
  thumbnail: string;
  description: string;
  genres: string[];
  info: Record<string, string | string[]>;
  quality?: string;
  sub_count?: string;
  watch_link?: string;
  link?: string;
  recommendations?: Array<{
    title: string;
    poster: string;
    url: string;
    qtip?: QtipData;
  }>;
  more_seasons?: Array<{
    is_current: boolean;
    link: string;
    poster: string;
    season_title: string;
    title: string;
  }>;
  related_anime?: Array<{
    dub?: string;
    episodes?: string;
    id: string;
    jname: string;
    link: string;
    poster: string;
    qtip?: QtipData;
    sub?: string;
    title: string;
    type: string;
  }>;
}

/**
 * Shape for anime list pages
 */
export interface AnimeListMapped {
  page: number;
  pagination: Array<{
    active: boolean;
    href: string | null;
    text: string;
  }>;
  results: Array<{
    title: string;
    thumbnail: string;
    link: string;
    type: string;
    duration?: string;
    description?: string;
    dub?: string;
    latest_episode?: string;
    qtip?: QtipData;
  }>;
}

/**
 * Maps API anime details to the format expected by AnimeInfoPage
 */
export function mapAnimeDetails(apiData: AnimeDetailsInfo): AnimeInfoMapped {
  return {
    title: apiData.title,
    thumbnail: apiData.thumbnail,
    description: apiData.description,
    genres: apiData.genres,
    info: apiData.info,
    quality: apiData.quality,
    sub_count: apiData.sub_count,
    watch_link: apiData.watch_link,
    link: apiData.link,
    recommendations: apiData.recommendations?.map(rec => {
      const poster = rec.poster || rec.thumbnail || '';
      const url = rec.url || rec.link || '';
      return {
        title: rec.title || rec.jname || 'Untitled',
        poster,
        url,
        qtip: rec.qtip
      };
    }),
    more_seasons: apiData.more_seasons,
    related_anime: apiData.related_anime
  };
}

/**
 * Input type for mapAnimeListResults - accepts PaginatedResult or generic object
 */
type ListResultsInput = PaginatedResult<BasicAnime> | { results: BasicAnime[]; page?: number; pagination?: Array<{ active: boolean; href: string | null; text: string }> } | Record<string, unknown>;

/**
 * Maps API list results to a standardized format
 */
export function mapAnimeListResults(apiData: ListResultsInput): AnimeListMapped {
  const data = apiData as {
    page?: number;
    pagination?: Array<{ active: boolean; href: string | null; text: string }>;
    results?: Array<Record<string, unknown>>;
  };
  
  return {
    page: data.page || 1,
    pagination: data.pagination || [],
    results: (data.results || []).map((item) => ({
      title: (item.title as string) || (item.jname as string) || 'Untitled',
      thumbnail: (item.thumbnail as string) || (item.poster as string) || '',
      link: (item.link as string) || (item.url as string) || '',
      type: (item.type as string) || 'TV',
      duration: item.duration as string | undefined,
      description: item.description as string | undefined,
      dub: item.dub as string | undefined,
      latest_episode: (item.latest_episode as string) || (item.eps as string) || undefined,
      qtip: item.qtip as QtipData | undefined
    }))
  };
}
