import { QtipData } from './qtip';

/**
 * Server item for video streaming
 */
export interface ServerItem {
  data_id: string;
  default: boolean;
  ifram_src: string;
  name: string;
  server_id: string;
}

/**
 * Simple server object for backward compatibility
 */
export interface SimpleServer {
  src: string;
}

/**
 * Episode information
 */
export interface Episode {
  episode_nr: number;
  id: string;
  iframe_src?: string;
  real_id: string;
  s_id?: string;
  jname?: string;
  servers: {
    dub?: ServerItem[] | SimpleServer;
    sub?: ServerItem[] | SimpleServer;
  };
  title: string;
}

/**
 * Season information
 */
export interface Season {
  active: boolean;
  poster: string;
  title: string;
  url: string;
}

/**
 * Recommendation with full qtip data
 */
export interface WatchRecommendation {
  jname: string;
  poster: string;
  qtip: QtipData & {
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
}

/**
 * Watch page detail information
 */
export interface WatchDetail {
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
}

/**
 * Complete watch page data
 */
export interface WatchData {
  episodes: Episode[];
  recommendations: WatchRecommendation[];
  total_episodes: number;
  other_seasons?: Season[];
  watch_detail: WatchDetail;
}
