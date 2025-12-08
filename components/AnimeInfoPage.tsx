"use client";
import Image from "next/image";
import { useState } from "react";
import { TopAnime } from "./TopAnime";
import { AnimeCard } from "./AnimeCard";
import type { QtipData, BasicAnime } from "@/models";

interface AnimeInfo {
  title: string;
  thumbnail: string;
  description: string;
  genres: string[];
  info: {
    Japanese?: string;
    Synonyms?: string;
    Aired?: string;
    Duration?: string;
    Premiered?: string;
    Status?: string;
    "MAL Score"?: string;
    Studios?: string[];
    Producers?: string[];
    Genres?: string[];
  };
  quality?: string;
  sub_count?: string;
  dub_count?: string;
  watch_link?: string;
  link?: string;
  type?: string;
  recommendations?: Array<{
    title: string;
    poster: string; // fully qualified or relative image URL
    url: string;    // full or relative link
    qtip?: QtipData;
  }>;
}

interface AnimeInfoPageProps {
  animeInfo: AnimeInfo;
  topAnimeData?: {
    topAiring: BasicAnime[];
    mostPopular: BasicAnime[];
    mostFavorite: BasicAnime[];
    completed: BasicAnime[];
  };
}

export function AnimeInfoPage({ animeInfo, topAnimeData }: AnimeInfoPageProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  // Determine the anime type for breadcrumbs
  const getAnimeType = () => {
    if (animeInfo.type) return animeInfo.type;
    // Fallback to checking if it's in info object
    return "TV"; // Default fallback
  };
  
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: getAnimeType(), href: `/${getAnimeType().toLowerCase()}` },
    { label: animeInfo.title, href: "#" }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-white/60 mb-8">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">•</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-white">{breadcrumb.label}</span>
              ) : (
                <a href={breadcrumb.href} className="hover:text-white transition-colors">
                  {breadcrumb.label}
                </a>
              )}
            </div>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Anime Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="relative w-60 h-80 overflow-hidden bg-gray-800">
                  <Image
                    src={animeInfo.thumbnail}
                    alt={animeInfo.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-4">{animeInfo.title}</h1>
                
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {animeInfo.quality && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-[linear-gradient(to_right,rgba(59,130,246,0.25),rgba(59,130,246,0.08))] ring-1 ring-blue-500/40 text-blue-200 shadow-[0_0_0_1px_rgba(59,130,246,0.2)] backdrop-blur-sm rounded-full">
                      {animeInfo.quality}
                    </span>
                  )}
                  {animeInfo.sub_count && animeInfo.sub_count !== "0" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-[linear-gradient(to_right,rgba(147,51,234,0.25),rgba(147,51,234,0.08))] ring-1 ring-purple-500/40 text-purple-200 shadow-[0_0_0_1px_rgba(147,51,234,0.2)] backdrop-blur-sm rounded-full">
                      <Image src="/cc.svg" alt="CC" width={12} height={12} className="w-3 h-3 brightness-0 invert" />
                      {animeInfo.sub_count}
                    </span>
                  )}
                  {animeInfo.dub_count && animeInfo.dub_count !== "0" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-[linear-gradient(to_right,rgba(16,185,129,0.25),rgba(16,185,129,0.08))] ring-1 ring-emerald-500/40 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] backdrop-blur-sm rounded-full">
                      <Image src="/mic.svg" alt="MIC" width={12} height={12} className="w-3 h-3 brightness-0 invert" />
                      {animeInfo.dub_count}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-[linear-gradient(to_right,rgba(236,72,153,0.25),rgba(236,72,153,0.08))] ring-1 ring-pink-500/40 text-pink-200 shadow-[0_0_0_1px_rgba(236,72,153,0.2)] backdrop-blur-sm rounded-full">
                    {getAnimeType()}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-[linear-gradient(to_right,rgba(75,85,99,0.25),rgba(75,85,99,0.08))] ring-1 ring-gray-500/40 text-gray-200 shadow-[0_0_0_1px_rgba(75,85,99,0.2)] backdrop-blur-sm rounded-full">
                    {animeInfo.info?.Duration || "24m"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <a
                    href={animeInfo.watch_link || "#"}
                    className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition shadow"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l8-5z"/>
                    </svg>
                    Watch Now
                  </a>
                  <button className="inline-flex items-center gap-1 px-5 h-11 rounded-full text-white font-medium text-sm transition bg-white/5 hover:bg-white/10 backdrop-blur-sm ring-1 ring-white/15 hover:ring-white/25">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add to List
                  </button>
                </div>

                {/* Description */}
                <div className="text-white/80 leading-relaxed text-sm">
                  <p className={showFullDescription ? "" : "line-clamp-3"}>
                    {animeInfo.description || "No description available."}
                  </p>
                  {animeInfo.description && animeInfo.description.length > 200 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-purple-400 hover:cursor-pointer hover:text-purple-300 mt-2 text-sm font-medium"
                    >
                      {showFullDescription ? "- Less" : "+ More"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-[#1a1a1a] backdrop-blur-xxl rounded-md p-6">
              <div className="space-y-3">
                {animeInfo.info?.Japanese && (
                  <div className="text-sm">
                    <span className="text-white/60">Japanese: </span>
                    <span className="text-white">{animeInfo.info.Japanese}</span>
                  </div>
                )}
                {animeInfo.info?.Synonyms && (
                  <div className="text-sm">
                    <span className="text-white/60">Synonyms: </span>
                    <span className="text-white">{animeInfo.info.Synonyms}</span>
                  </div>
                )}
                {animeInfo.info?.Aired && (
                  <div className="text-sm">
                    <span className="text-white/60">Aired: </span>
                    <span className="text-white">{animeInfo.info.Aired}</span>
                  </div>
                )}
                
                {animeInfo.info?.Premiered && (
                  <div className="text-sm">
                    <span className="text-white/60">Premiered: </span>
                    <span className="text-white">{animeInfo.info.Premiered}</span>
                  </div>
                )}
                
                {animeInfo.info?.Duration && (
                  <div className="text-sm">
                    <span className="text-white/60">Duration: </span>
                    <span className="text-white">{animeInfo.info.Duration}</span>
                  </div>
                )}
                
                {animeInfo.info?.Status && (
                  <div className="text-sm">
                    <span className="text-white/60">Status: </span>
                    <span className="text-white">{animeInfo.info.Status}</span>
                  </div>
                )}
                
                {animeInfo.info?.["MAL Score"] && (
                  <div className="text-sm">
                    <span className="text-white/60">MAL Score: </span>
                    <span className="text-white">{animeInfo.info["MAL Score"]}</span>
                  </div>
                )}
                
                {animeInfo.genres && animeInfo.genres.length > 0 && (
                  <div className="text-sm">
                    <span className="text-white/60">Genres: </span>
                    <div className="inline-flex flex-wrap gap-1.5 mt-1">
                      {animeInfo.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs bg-white/10 text-white/80 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {animeInfo.info?.Studios && animeInfo.info.Studios.length > 0 && (
                  <div className="text-sm">
                    <span className="text-white/60">Studios: </span>
                    <span className="text-white">{animeInfo.info.Studios.join(", ")}</span>
                  </div>
                )}
                
                {animeInfo.info?.Producers && animeInfo.info.Producers.length > 0 && (
                  <div className="text-sm">
                    <span className="text-white/60">Producers: </span>
                    <span className="text-white">{animeInfo.info.Producers.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {animeInfo.recommendations && animeInfo.recommendations.length > 0 && (
          <div className="mt-12 grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8">
              <h2 className="text-2xl font-bold text-white mb-6">You might also like</h2>
              <div className="grid grid-cols-6 gap-4">
                {animeInfo.recommendations
                  .slice(0, 12)
                  .filter(rec => rec.poster && rec.poster.trim() !== "")
                  .map((rec, index) => {
                    const poster = rec.poster && rec.poster.trim() !== "" ? rec.poster : "/yumelogo.png";
                    const href = rec.url && rec.url.trim() !== "" ? rec.url : "#";
                    
                    // Transform recommendation to AnimeCard format
                    const animeCardData = {
                      link: href,
                      thumbnail: poster,
                      title: rec.title || 'Untitled',
                      type: rec.qtip?.type || 'TV',
                      qtip: rec.qtip,
                      latest_episode: rec.qtip?.eps || undefined,
                      dub: rec.qtip?.dub,
                      duration: "24m" // Default duration
                    };
                    
                    return (
                      <AnimeCard
                        key={index}
                        anime={animeCardData}
                        showMeta={true}
                        badgeType="latest"
                      />
                    );
                  })}
              </div>
            </div>
            
            {/* TopAnime Sidebar */}
            <div className="xl:col-span-4">
              {topAnimeData && (
                <TopAnime 
                  data={{
                    top_today: topAnimeData.topAiring.slice(0, 10).map((anime, index) => ({
                      ...anime,
                      rank: (index + 1).toString()
                    })),
                    top_week: topAnimeData.mostPopular.slice(0, 10).map((anime, index) => ({
                      ...anime,
                      rank: (index + 1).toString()
                    })),
                    top_month: topAnimeData.mostFavorite.slice(0, 10).map((anime, index) => ({
                      ...anime,
                      rank: (index + 1).toString()
                    }))
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}