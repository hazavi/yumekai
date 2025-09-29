'use client';

import { notFound, useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { AnimeCard } from "@/components/AnimeCard";
import { useEffect, useState } from "react";
/**
 * Watch Page Security / Ad Mitigation Notes
 * ----------------------------------------
 * We cannot fully guarantee removal of third‑party ads if the upstream iframe source embeds them,
 * but we reduce common redirect / popup vectors by:
 *  - sandboxing the iframe (no top-level navigation, restricted capabilities)
 *  - limiting feature permissions via `allow`
 *  - suppressing referrer leakage (referrerPolicy="no-referrer")
 *  - adding rel="noopener noreferrer" to outbound recommendation links
 * If stronger stripping is required, next step would be to create a server-side proxy that fetches
 * and sanitizes the remote HTML (remove <script>, tracking pixels). That carries maintenance & legal
 * implications depending on content source. For now this is a lightweight defensive layer.
 */

interface Server {
  data_id: string;
  default: boolean;
  ifram_src: string;
  name: string;
  server_id: string;
}

interface Episode {
  episode_nr: number;
  id: string;
  jname: string;
  real_id: string;
  servers: {
    dub: Server[];
    sub: Server[];
  };
  title: string;
}

interface Recommendation {
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
}

interface WatchData {
  episodes: Episode[];
  recommendations: Recommendation[];
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
}

async function getWatchData(slug: string, ep?: string): Promise<WatchData | null> {
  try {
    return await api.watch(slug, ep);
  } catch (error) {
    console.error('Error fetching watch data:', error);
    return null;
  }
}

export default function WatchPage() {
  const routeParams = useParams<{ slug: string }>();
  const query = useSearchParams();
  const slug = routeParams.slug;
  const ep = query.get('ep') || '';

  const [data, setData] = useState<WatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIframeSrc, setCurrentIframeSrc] = useState<string>('');
  const fetchingRef = useState<{ key: string; done: boolean }>({ key: '', done: false })[0];

  useEffect(() => {
    let active = true;
    async function run() {
      const fetchKey = `${slug}|${ep}`;
      if (fetchingRef.done && fetchingRef.key === fetchKey) return; // already fetched this combination
      fetchingRef.done = true;
      fetchingRef.key = fetchKey;
      try {
        const watchData = await getWatchData(slug, ep || undefined);
        if (active) {
          setData(watchData);
          // Set initial iframe source when data is loaded
          if (watchData) {
            const currentEpisode = watchData.episodes[0];
            const subServers = currentEpisode?.servers?.sub || [];
            const dubServers = currentEpisode?.servers?.dub || [];
            
            const defaultSub = subServers.find(server => server.default);
            if (defaultSub) {
              setCurrentIframeSrc(defaultSub.ifram_src);
            } else {
              const defaultDub = dubServers.find(server => server.default);
              if (defaultDub) {
                setCurrentIframeSrc(defaultDub.ifram_src);
              } else {
                setCurrentIframeSrc(subServers[0]?.ifram_src || dubServers[0]?.ifram_src || '');
              }
            }
          }
        }
      } catch (e) {
        console.error('Error loading watch data:', e);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => { active = false; };
  }, [slug, ep, fetchingRef]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20">
        {/* Breadcrumb Skeleton */}
        <div className="py-4 px-6 border-b border-gray-800/50">
          <div className="container mx-auto">
            <div className="flex items-center text-sm text-gray-400">
              <div className="w-12 h-4 bg-gray-800 animate-pulse"></div>
              <div className="w-4 h-4 mx-3 bg-gray-700 animate-pulse"></div>
              <div className="w-8 h-4 bg-gray-800 animate-pulse"></div>
              <div className="w-4 h-4 mx-3 bg-gray-700 animate-pulse"></div>
              <div className="w-32 h-4 bg-gray-700 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar Skeleton - Episodes List */}
            <div className="col-span-3">
              <div className="bg-black border border-gray-800 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-800 animate-pulse rounded-lg"></div>
                    <div>
                      <div className="w-20 h-5 bg-gray-800 animate-pulse mb-1"></div>
                      <div className="w-8 h-3 bg-gray-700 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="w-28 h-10 bg-gray-800 animate-pulse"></div>
                </div>
                
                <div className="space-y-1 max-h-96">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 bg-gray-800 animate-pulse rounded-lg"></div>
                      <div className="flex-1">
                        <div className="w-20 h-4 bg-gray-800 animate-pulse mb-1"></div>
                        <div className="w-16 h-3 bg-gray-700 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="col-span-6">
              {/* Video Player Skeleton */}
              <div className="relative group">
                <div className="bg-black border border-gray-800 shadow-2xl overflow-hidden">
                  <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gray-700 animate-pulse rounded-lg mx-auto"></div>
                      <div className="w-32 h-4 bg-gray-700 animate-pulse mx-auto"></div>
                    </div>
                  </div>
                  
                  {/* Video Controls Skeleton */}
                  <div className="bg-black border-t border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-8 bg-gray-800 animate-pulse"></div>
                        <div className="w-16 h-8 bg-gray-800 animate-pulse"></div>
                        <div className="w-24 h-6 bg-gray-800 animate-pulse"></div>
                        <div className="w-24 h-6 bg-gray-800 animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-8 bg-gray-800 animate-pulse"></div>
                        <div className="w-12 h-8 bg-gray-800 animate-pulse"></div>
                        <div className="w-20 h-8 bg-gray-800 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Server Selection Skeleton */}
              <div className="bg-black border border-gray-800 p-6 shadow-2xl mt-6">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-800 animate-pulse rounded-lg"></div>
                    <div className="w-40 h-5 bg-gray-800 animate-pulse"></div>
                  </div>
                  <div className="w-64 h-4 bg-gray-700 animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {/* SUB Servers Skeleton */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-800 animate-pulse rounded-lg"></div>
                      <div className="w-16 h-4 bg-gray-800 animate-pulse"></div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="w-12 h-8 bg-gray-800 animate-pulse"></div>
                      ))}
                    </div>
                  </div>

                  {/* DUB Servers Skeleton */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-800 animate-pulse rounded-lg"></div>
                      <div className="w-14 h-4 bg-gray-800 animate-pulse"></div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div key={i} className="w-12 h-8 bg-gray-800 animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Skeleton - Anime Details */}
            <div className="col-span-3">
              <div className="bg-black border border-gray-800 p-6 shadow-2xl space-y-6">
                {/* Anime Poster Skeleton */}
                <div className="text-center">
                  <div className="w-full h-80 bg-gray-800 animate-pulse mb-6 border border-gray-800"></div>
                  <div className="w-32 h-6 bg-gray-800 animate-pulse mx-auto mb-4"></div>
                  
                  {/* Badges Skeleton */}
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i} className="w-12 h-6 bg-gray-800 animate-pulse"></div>
                    ))}
                  </div>
                  
                  <div className="w-16 h-4 bg-gray-700 animate-pulse mx-auto mb-4"></div>
                  
                  {/* Rating Skeleton */}
                  <div className="bg-gray-900 border border-gray-800 p-4 mb-6">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 bg-gray-800 animate-pulse rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-800 animate-pulse"></div>
                      <div className="w-8 h-4 bg-gray-700 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Description Skeleton */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-800 animate-pulse rounded-lg"></div>
                    <div className="w-16 h-4 bg-gray-800 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-gray-700 animate-pulse"></div>
                    <div className="w-full h-3 bg-gray-700 animate-pulse"></div>
                    <div className="w-3/4 h-3 bg-gray-700 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Skeleton */}
          <div className="mt-8">
            <div className="w-40 h-6 bg-gray-800 animate-pulse mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[3/4] bg-gray-800 animate-pulse"></div>
                  <div className="w-full h-3 bg-gray-700 animate-pulse"></div>
                  <div className="w-3/4 h-3 bg-gray-700 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!data) {
    notFound();
  }

  const currentEpisode = data.episodes[0];
  const currentEpNumber = ep ? parseInt(ep) : 1;

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Breadcrumb */}
      <div className="py-4 px-6 border-b border-gray-800/50">
        <div className="container mx-auto">
          <div className="flex items-center text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors duration-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </a>
            <svg className="w-4 h-4 mx-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a href="/tv" className="hover:text-white transition-colors duration-300">TV</a>
            <svg className="w-4 h-4 mx-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">{data.watch_detail?.title || 'Anime'}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Episodes List */}
          <div className="col-span-3">
            <div className="bg-black border border-gray-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-xl flex items-center gap-3">
                  <div className="p-2.5 bg-purple-600 rounded-lg shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  Episodes
                  <span className="text-sm text-gray-400 font-normal">({data.total_episodes})</span>
                </h3>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Episode #"
                    className="w-28 px-3 py-2.5 text-sm bg-black border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    min="1"
                    max={data.total_episodes}
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      const value = parseInt(target.value);
                      if (!isNaN(value) && value >= 1 && value <= data.total_episodes) {
                        const targetElement = document.querySelector(`[data-episode="${value}"]`);
                        if (targetElement) {
                          targetElement.classList.add('animate-pulse', 'bg-yellow-500/30', 'ring-2', 'ring-yellow-400/50');
                          setTimeout(() => {
                            targetElement.classList.remove('animate-pulse', 'bg-yellow-500/30', 'ring-2', 'ring-yellow-400/50');
                          }, 2000);
                          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-1 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black">
                {Array.from({ length: data.total_episodes }, (_, i) => i + 1).map((episodeNum) => (
                  <a
                    key={episodeNum}
                    href={`/watch/${slug}?ep=${episodeNum}`}
                    data-episode={episodeNum}
                    className={`group flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 hover:scale-[1.01] border-l-4 ${
                      episodeNum === currentEpNumber
                        ? 'bg-purple-600/20 text-white border-l-purple-500 shadow-lg shadow-purple-600/10'
                        : 'text-gray-300 hover:text-white hover:bg-gray-900/60 border-l-transparent hover:border-l-gray-600'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all duration-300 ${
                      episodeNum === currentEpNumber
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-800 text-gray-400 group-hover:bg-gray-700 group-hover:text-gray-300'
                    }`}>
                      {episodeNum}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Episode {episodeNum}</div>
                      {episodeNum === currentEpNumber && (
                        <div className="text-xs text-purple-300 mt-1">Currently Watching</div>
                      )}
                    </div>
                    {episodeNum === currentEpNumber && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-6">
            {/* Video Player with Controls */}
            <div className="relative group">
              <div className="bg-black border border-gray-800 shadow-2xl overflow-hidden">
                <div className="relative aspect-video">
                  {currentIframeSrc ? (
                    <iframe
                      src={currentIframeSrc}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-orientation-lock"
                      referrerPolicy="no-referrer"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <div className="text-center space-y-4">
                        <svg className="w-16 h-16 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400 font-medium">No video source available</p>
                      </div>
                    </div>
                  )}
                </div>
                
                
              </div>
            </div>

            {/* Server Selection */}
            <div className="bg-black border border-gray-800 p-6 shadow-2xl mt-6">
              <div className="text-white mb-6">
                <h4 className="text-lg font-bold mb-2 flex items-center gap-3">
                  <div className="p-2.5 bg-pink-600 rounded-lg shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Watching Episode {currentEpisode?.episode_nr || currentEpNumber}
                </h4>
                <p className="text-gray-400 text-sm">
                  If current server doesn't work, try other servers below.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* SUB Servers */}
                {currentEpisode?.servers?.sub && currentEpisode.servers.sub.length > 0 && (
                  <div className="space-y-4">
                    <h5 className="text-white font-bold flex items-center gap-3">
                      <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
                        </svg>
                      </div>
                      Subtitled
                    </h5>
                    <div className="flex gap-3 flex-wrap">
                      {currentEpisode.servers.sub.map((server) => (
                        <button
                          key={server.server_id}
                          onClick={() => setCurrentIframeSrc(server.ifram_src)}
                          className={`group px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 border ${
                            currentIframeSrc === server.ifram_src
                              ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/25' 
                              : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-blue-600/20 border-gray-700 hover:border-blue-500'
                          }`}
                        >
                          {server.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* DUB Servers */}
                {currentEpisode?.servers?.dub && currentEpisode.servers.dub.length > 0 && (
                  <div className="space-y-4">
                    <h5 className="text-white font-bold flex items-center gap-3">
                      <div className="p-2 bg-green-600 rounded-lg shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                      Dubbed
                    </h5>
                    <div className="flex gap-3 flex-wrap">
                      {currentEpisode.servers.dub.map((server) => (
                        <button
                          key={server.server_id}
                          onClick={() => setCurrentIframeSrc(server.ifram_src)}
                          className={`group px-4 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 border ${
                            currentIframeSrc === server.ifram_src
                              ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-600/25' 
                              : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-green-600/20 border-gray-700 hover:border-green-500'
                          }`}
                        >
                          {server.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Anime Details */}
          <div className="col-span-3">
            {data.watch_detail && (
              <div className="bg-black border border-gray-800 p-6 shadow-2xl space-y-6">
                {/* Anime Poster and Title */}
                <div className="text-center">
                  <div className="relative group mb-6">
                    <img
                      src={data.watch_detail.poster}
                      alt={data.watch_detail.title}
                      className="w-full h-80 object-cover shadow-2xl border border-gray-800 transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-4 leading-tight">{data.watch_detail.title}</h2>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    <span className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-white text-xs font-medium">{data.watch_detail.content_rating}</span>
                    <span className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium shadow-lg">{data.watch_detail.quality}</span>
                    <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium shadow-lg">{data.watch_detail.sub_count}</span>
                    <span className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium shadow-lg">{data.watch_detail.type}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{data.watch_detail.duration}</span>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="bg-yellow-600/10 border border-yellow-600/30 p-4 mb-6">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2 bg-yellow-600/20 rounded-lg">
                        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <span className="text-white font-bold text-2xl">9.2</span>
                      <span className="text-gray-400 text-sm">/ 10</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-white font-bold mb-4 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Synopsis
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    After the destruction of their hometown, childhood friends Kafka Hibino and Mina Ashiro make a pact to become officers in the Defense Force—a militarized organization tasked with protecting Japan from colossal monsters known as "kaijuu." Decades later, the...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations - Full Width */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">You might also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {data.recommendations.slice(0, 16).map((rec, index) => (
                <AnimeCard
                  key={index}
                  anime={{
                    title: rec.title,
                    thumbnail: rec.poster,
                    link: rec.url,
                    type: rec.qtip.type,
                    duration: rec.qtip.eps ? `${rec.qtip.eps} eps` : undefined,
                    qtip: {
                      ...rec.qtip,
                      dub: rec.qtip.dub || undefined,
                      synonyms: rec.qtip.synonyms || undefined
                    },
                    latest_episode: rec.qtip.sub,
                    dub: rec.qtip.dub || undefined
                  }}
                  showMeta={true}
                  badgeType="latest"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}