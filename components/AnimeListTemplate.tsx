"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { AnimeCard } from "./AnimeCard";
import { TopAnime } from "./TopAnime";
import { TopAnimeCategories } from "./TopAnimeCategories";
import { Genres } from "./Genres";
import { Pagination } from "./Pagination";
import { AnimeInfoPopup } from "./AnimeInfoPopup";
import type { QtipData, BasicAnime, Genre } from "@/models";

interface AnimeResult {
  title: string;
  thumbnail: string;
  link: string;
  type: string;
  duration?: string;
  description?: string;
  dub?: string;
  latest_episode?: string;
  qtip?: QtipData;
}

interface PaginationItem {
  active: boolean;
  href: string | null;
  text: string;
}

interface AnimeListData {
  page: number;
  pagination: PaginationItem[];
  results: AnimeResult[];
}

interface AnimeListTemplateProps {
  title: string;
  data: AnimeListData;
  topAnimeData?: {
    top_today: BasicAnime[];
    top_week: BasicAnime[];
    top_month: BasicAnime[];
  };
  topAnimeCategoriesData?: {
    topAiring: BasicAnime[];
    mostPopular: BasicAnime[];
    mostFavorite: BasicAnime[];
    completed: BasicAnime[];
  };
  genresData?: Genre[];
  basePath: string;
}

export function AnimeListTemplate({ 
  title, 
  data, 
  topAnimeData, 
  topAnimeCategoriesData,
  genresData,
  basePath 
}: AnimeListTemplateProps) {
  const { results, pagination, page } = data;
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentAnime, setCurrentAnime] = useState<AnimeResult | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent, anime: AnimeResult) => {
    if (!anime.qtip) return;
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top + rect.height / 2;
    setPopupPosition({ x, y });
    setCurrentAnime(anime);
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    // Add a delay before hiding to allow moving to popup
    hideTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
      setCurrentAnime(null);
    }, 100);
  };

  const handlePopupMouseEnter = () => {
    // Keep popup visible when hovering over it
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handlePopupMouseLeave = () => {
    // Hide popup when leaving popup area
    setShowPopup(false);
    setCurrentAnime(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* First 4 anime in one row */}
            {results.length > 0 && (
              <div className="mb-12">
                <div className="grid grid-cols-4 gap-6">
                  {results.slice(0, 4).map((anime, index) => (
                    <div key={index} className="relative">
                      <div 
                        className="relative overflow-hidden bg-black/20 backdrop-blur-sm group"
                        onMouseEnter={(e) => handleMouseEnter(e, anime)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <a href={anime.link} className="block aspect-[3/4] relative">
                          <Image
                            src={anime.thumbnail}
                            alt={anime.title}
                            fill
                            sizes="(max-width:768px) 40vw, (max-width:1200px) 20vw, 15vw"
                            className="object-cover transition-all duration-300 group-hover:blur-sm"
                            priority={index === 0}
                          />
                          
                          {/* Play button overlay on hover */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                            <div className="flex items-center justify-center w-16 h-16 hover:transition-all duration-300 hover:scale-110">
                              <Image
                                src="/playbutton.svg"
                                alt="Play"
                                width={64}
                                height={64}
                                className="ml-1 filter brightness-0 invert"
                              />
                            </div>
                          </div>
                          
                          {/* Bottom black vignette */}
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                          
                          {/* Badges */}
                          {(anime.dub || anime.latest_episode) && (
                            <div className="absolute bottom-2 left-2 flex items-center gap-2">
                              {/* SUB badge with CC icon and episode number */}
                              <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium bg-[linear-gradient(to_right,rgba(147,51,234,0.25),rgba(147,51,234,0.08))] ring-1 ring-purple-500/40 text-purple-200 shadow-[0_0_0_1px_rgba(147,51,234,0.2)] backdrop-blur-sm">
                                <Image src="/cc.svg" alt="CC" width={14} height={14} className="w-3.5 h-3.5 brightness-0 invert" />
                                {anime.latest_episode || 'SUB'}
                              </span>
                              {/* DUB badge with mic icon */}
                              {anime.dub && (
                                <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium bg-[linear-gradient(to_right,rgba(16,185,129,0.25),rgba(16,185,129,0.08))] ring-1 ring-emerald-500/40 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] backdrop-blur-sm">
                                <Image src="/mic.svg" alt="Mic" width={14} height={14} className="w-3.5 h-3.5 brightness-0 invert" />
                                   {anime.dub}
                                </span>
                              )}
                            </div>
                          )}
                        </a>
                      </div>
                      
                      {/* Title and Meta Info */}
                      <div className="mt-2 px-1">
                        <a 
                          href={anime.link} 
                          className="block text-sm font-medium text-white/90 truncate hover:text-white transition-colors"
                          title={anime.title}
                        >
                          {anime.title}
                        </a>
                        
                        {/* Description */}
                        {anime.description && (
                          <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mt-2">
                            {anime.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-white/60">
                          {anime.type && <span className="uppercase tracking-wide">{anime.type}</span>}
                          {anime.type && anime.duration && <span>•</span>}
                          {anime.duration && <span>{anime.duration}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rest of the anime in 6 per row grid format */}
            {results.length > 4 && (
              <div className="grid grid-cols-6 gap-4">
                {results.slice(4).map((anime, index) => {
                  // Transform to AnimeCard format
                  const animeCardData = {
                    link: anime.link,
                    thumbnail: anime.thumbnail,
                    title: anime.title,
                    type: anime.type,
                    qtip: anime.qtip,
                    latest_episode: anime.latest_episode,
                    dub: anime.dub,
                    duration: anime.duration || "24m"
                  };

                  return (
                    <AnimeCard
                      key={index + 4}
                      anime={animeCardData}
                      showMeta={true}
                      badgeType="latest"
                    />
                  );
                })}
              </div>
            )}

            {/* All anime in 6 per row grid if less than or equal to 4 */}
            {results.length <= 4 && results.length > 0 && (
              <div className="grid grid-cols-6 gap-4">
                {results.map((anime, index) => {
                  // Transform to AnimeCard format
                  const animeCardData = {
                    link: anime.link,
                    thumbnail: anime.thumbnail,
                    title: anime.title,
                    type: anime.type,
                    qtip: anime.qtip,
                    latest_episode: anime.latest_episode,
                    dub: anime.dub,
                    duration: anime.duration || "24m"
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
            )}

            {/* No results message */}
            {results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No anime found</p>
              </div>
            )}

            {/* Pagination */}
            <Pagination 
              pagination={pagination}
              currentPage={page}
              basePath={basePath}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* TopAnime Component */}
            {topAnimeData && (
              <TopAnime 
                data={{
                  top_today: (topAnimeData.top_today || []).slice(0, 10).map((anime, index) => ({
                    ...anime,
                    rank: (index + 1).toString()
                  })),
                  top_week: (topAnimeData.top_week || []).slice(0, 10).map((anime, index) => ({
                    ...anime,
                    rank: (index + 1).toString()
                  })),
                  top_month: (topAnimeData.top_month || []).slice(0, 10).map((anime, index) => ({
                    ...anime,
                    rank: (index + 1).toString()
                  }))
                }}
              />
            )}

            {/* TopAnimeCategories Component */}
            {topAnimeCategoriesData && (
              topAnimeCategoriesData.topAiring.length > 0 ||
              topAnimeCategoriesData.mostPopular.length > 0 ||
              topAnimeCategoriesData.mostFavorite.length > 0 ||
              topAnimeCategoriesData.completed.length > 0
            ) && (
              <TopAnimeCategories 
                topAiring={topAnimeCategoriesData?.topAiring || []}
                mostPopular={topAnimeCategoriesData?.mostPopular || []}
                mostFavorite={topAnimeCategoriesData?.mostFavorite || []}
                completed={topAnimeCategoriesData?.completed || []}
              />
            )}

            {/* Genres Component */}
            {genresData && genresData.length > 0 && (
              <Genres genres={genresData} />
            )}
          </div>
        </div>

        {/* AnimeInfoPopup */}
        {showPopup && currentAnime && currentAnime.qtip && (
          <AnimeInfoPopup
            qtip={currentAnime.qtip}
            poster={currentAnime.thumbnail}
            slug={currentAnime.link}
            isVisible={showPopup}
            position={popupPosition}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          />
        )}
      </div>
    </div>
  );
}