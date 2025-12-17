import { QtipData } from './qtip';

/**
 * Basic anime information used across the app
 */
export interface BasicAnime {
  link: string; // slug like "/one-piece"
  thumbnail: string;
  title: string;
  type: string; // TV, Movie, etc.
  qtip?: QtipData;
}

/**
 * Extended anime info with update details
 */
export interface UpdatedAnime extends BasicAnime {
  description?: string;
  dub?: string; // SUB / DUB
  duration?: string; // e.g. 24m
  latest_episode?: string; // e.g. EP 1100
}

/**
 * Spotlight/featured anime item
 */
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

/**
 * Trending anime item
 */
export interface TrendingItem {
  jname: string;
  poster: string;
  qtip?: QtipData;
  rank: string;
  title: string;
  url: string;
}

/**
 * Top anime grouped by time period
 */
export interface TopAnimeGroups {
  today: BasicAnime[];
  week: BasicAnime[];
  month: BasicAnime[];
}

/**
 * Top anime data from API
 */
export interface TopAnimeData {
  top_today: (BasicAnime & { rank: string })[];
  top_week: (BasicAnime & { rank: string })[];
  top_month: (BasicAnime & { rank: string })[];
}

/**
 * Genre information
 */
export interface Genre {
  name: string;
  slug: string;
  url: string;
}

/**
 * Detailed anime information
 */
export interface AnimeDetailsInfo {
  description: string;
  genres: string[];
  info: Record<string, string | string[]>;
  link: string;
  quality: string;
  sub_count: string;
  thumbnail: string;
  title: string;
  watch_link: string;
  recommendations?: AnimeRecommendation[];
  qtip?: QtipData;
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
 * Anime recommendation item
 */
export interface AnimeRecommendation {
  title: string;
  poster: string;
  url: string;
  jname?: string;
  qtip?: QtipData;
  link?: string;
  thumbnail?: string;
}

/**
 * Alias for backward compatibility
 */
export type AnimeCardData = BasicAnime;
