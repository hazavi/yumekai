"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BasicAnime } from "@/models";
import { AnimeInfoPopup } from "./AnimeInfoPopup";

interface TopAnimeCategoriesProps {
  topAiring: BasicAnime[];
  mostPopular: BasicAnime[];
  mostFavorite: BasicAnime[];
  completed: BasicAnime[];
}

type TabType = 'airing' | 'popular' | 'favorite' | 'completed';

interface TabConfig {
  key: TabType;
  label: string;
  route: string;
}

const tabs: TabConfig[] = [
  { key: 'airing', label: 'Top Airing', route: '/top-airing' },
  { key: 'popular', label: 'Most Popular', route: '/most-popular' },
  { key: 'favorite', label: 'Most Favorite', route: '/most-favorite' },
  { key: 'completed', label: 'Last Completed', route: '/completed' }
];

export function TopAnimeCategories({ topAiring, mostPopular, mostFavorite, completed }: TopAnimeCategoriesProps) {
  const [activeTab, setActiveTab] = useState<TabType>('airing');
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentAnime, setCurrentAnime] = useState<BasicAnime | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent, anime: BasicAnime) => {
    if (!anime.qtip) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top + rect.height / 2;
    setPopupPosition({ x, y });
    setCurrentAnime(anime);
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowPopup(false);
    setCurrentAnime(null);
  };

  const getCurrentData = (): BasicAnime[] => {
    switch (activeTab) {
      case 'airing':
        return topAiring.slice(0, 5);
      case 'popular':
        return mostPopular.slice(0, 5);
      case 'favorite':
        return mostFavorite.slice(0, 5);
      case 'completed':
        return completed.slice(0, 5);
      default:
        return [];
    }
  };

  const getCurrentRoute = (): string => {
    return tabs.find(tab => tab.key === activeTab)?.route || '/top-airing';
  };

  const currentData = getCurrentData();

  return (
    <>
      <div className="px-5 py-5 w-full">
        {/* Tab Navigation at the top */}
        <div className="flex justify-center mb-0">
          <div className="grid grid-cols-2 gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-3 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-[linear-gradient(135deg,rgba(147,51,234,0.4),rgba(147,51,234,0.2))] text-white backdrop-blur-md border-t border-l border-r border-purple-400/50 rounded-t-lg'
                    : 'text-white/70 hover:text-white/90 bg-black/20 hover:bg-black/30 border-t border-l border-r border-white/10 rounded-t-lg'
                }`}
                style={{
                  clipPath: activeTab === tab.key ? 'none' : 'polygon(0 0, 100% 0, 100% 85%, 0 85%)'
                }}
              >
                {/* Glass effect overlay for active tab */}
                {activeTab === tab.key && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent rounded-t-lg pointer-events-none" />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content - connected to tabs */}
        <div className="bg-[#1a1a1a] rounded-lg p-4" style={{
          borderTop: 'none'
        }}>
          {currentData.length > 0 ? (
            <>
              <ol className="space-y-4">
                {currentData.map((anime, index) => {
                  const linkUrl = anime.link || '#';
                  const posterUrl = anime.thumbnail;
                  const displayRank = String(index + 1).padStart(2, '0');
                  
                  return (
                    <li 
                      key={linkUrl + index} 
                      className="flex items-center gap-4 relative group"
                      onMouseEnter={(e) => handleMouseEnter(e, anime)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="w-8 text-center">
                        <span className="text-[13px] font-bold text-white/80">{displayRank}</span>
                      </div>
                      <Link href={linkUrl} className="relative h-16 w-12 overflow-hidden bg-black/20 flex-shrink-0">
                        <Image src={posterUrl} alt={anime.title} fill sizes="60px" className="object-cover" />
                        {/* Bottom black vignette */}
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={linkUrl} className="block text-[14px] font-medium text-white/95 truncate hover:text-white transition-colors">
                          {anime.title}
                        </Link>
                        {/* Badges matching existing style */}
                        {anime.qtip && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {anime.qtip.sub && (
                              <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-full text-[10px] font-medium bg-[linear-gradient(to_right,rgba(147,51,234,0.25),rgba(147,51,234,0.08))] ring-1 ring-purple-500/40 text-purple-200 backdrop-blur-sm">
                                <img src="/cc.svg" alt="CC" className="w-3 h-3 brightness-0 invert" />
                                {anime.qtip.sub}
                              </span>
                            )}
                            {anime.qtip.dub && (
                              <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-full text-[10px] font-medium bg-[linear-gradient(to_right,rgba(16,185,129,0.25),rgba(16,185,129,0.08))] ring-1 ring-emerald-500/40 text-emerald-200 backdrop-blur-sm">
                                <img src="/mic.svg" alt="Mic" className="w-3 h-3 brightness-0 invert" />
                                {anime.qtip.dub}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
              
              {/* View All Button */}
              <div className="flex justify-center mt-4">
                <Link
                  href={getCurrentRoute()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 bg-[linear-gradient(to_right,rgba(147,51,234,0.2),rgba(147,51,234,0.06))] ring-1 ring-purple-500/30 rounded-lg backdrop-blur-sm transition-all duration-200 hover:bg-[linear-gradient(to_right,rgba(147,51,234,0.3),rgba(147,51,234,0.1))] hover:ring-purple-500/50 hover:text-white"
                >
                  View All
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth={2} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-sm text-white/60">No data available for {activeTab}</div>
          )}
        </div>
      </div>

      {/* Anime Info Popup */}
      {currentAnime && currentAnime.qtip && (
        <AnimeInfoPopup
          qtip={currentAnime.qtip}
          poster={currentAnime.thumbnail}
          slug={currentAnime.link}
          isVisible={showPopup}
          position={popupPosition}
          isSidebar={true}
        />
      )}
    </>
  );
}