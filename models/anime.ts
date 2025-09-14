import { QtipData } from './qtip';

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
  recommendations?: Array<{
    title: string;
    poster: string; // image url
    url: string; // full or relative url
    jname?: string;
    qtip?: QtipData;
    link?: string;
    thumbnail?: string;
  }>;
  qtip?: QtipData;
}

export type { BasicAnime as AnimeCardData };
