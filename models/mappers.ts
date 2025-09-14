import type { AnimeDetailsInfo } from './anime';
import type { QtipData } from './qtip';

// Shape consumed by AnimeInfoPage component
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
}

// Shape for anime list pages
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
        qtip: rec.qtip // Pass through complete qtip data
      };
    })
  };
}

export function mapAnimeListResults(apiData: any): AnimeListMapped {
  return {
    page: apiData.page || 1,
    pagination: apiData.pagination || [],
    results: (apiData.results || []).map((item: any) => ({
      title: item.title || item.jname || 'Untitled',
      thumbnail: item.thumbnail || item.poster || '',
      link: item.link || item.url || '',
      type: item.type || 'TV',
      duration: item.duration,
      description: item.description,
      dub: item.dub,
      latest_episode: item.latest_episode || item.eps,
      qtip: item.qtip
    }))
  };
}
