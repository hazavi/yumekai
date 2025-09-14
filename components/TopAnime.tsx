"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import type { TopAnimeData, BasicAnime } from "@/models";
import { AnimeInfoPopup } from "./AnimeInfoPopup";

interface TopAnimeProps {
  data: TopAnimeData;
  title?: string;
}

type TabType = 'today' | 'week' | 'month';

interface TopAnimeItem extends BasicAnime {
  rank: string;
}

export function TopAnime({ data, title = "Top Anime" }: TopAnimeProps) {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [showAll, setShowAll] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentAnime, setCurrentAnime] = useState<TopAnimeItem | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null); // no delay

  const handleMouseEnter = (e: React.MouseEvent, anime: TopAnimeItem) => {
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

  const getCurrentData = (): TopAnimeItem[] => {
    switch (activeTab) {
      case 'today':
        return data.top_today || [];
      case 'week':
        return data.top_week || [];
      case 'month':
        return data.top_month || [];
      default:
        return [];
    }
  };

  const currentItems = getCurrentData();
  const visibleItems = showAll ? currentItems : currentItems.slice(0, 5);
  const hasMore = currentItems.length > 5;

  const tabs = [
    { key: 'today' as TabType, label: 'Today' },
    { key: 'week' as TabType, label: 'Week' },
    { key: 'month' as TabType, label: 'Month' },
  ];

  return (
    <>
      <div className="px-5 py-5 w-full">
        {/* Header with title and tabs */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold text-white/95">{title}</h3>
          
          {/* Tab Navigation - smaller and on the right */}
          <div className="flex bg-black/20 rounded-md p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-[linear-gradient(to_right,rgba(147,51,234,0.3),rgba(147,51,234,0.1))] text-white ring-1 ring-purple-500/40 backdrop-blur-sm'
                    : 'text-white/70 hover:text-white/90 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          {visibleItems.length > 0 ? (
            <>
              <ol className="space-y-4">
                {visibleItems.map((anime, idx) => {
              const linkUrl = anime.link || '#';
              const posterUrl = anime.thumbnail;
              const displayRank = anime.rank || String(idx + 1).padStart(2, '0');
              
              return (
                <li 
                  key={linkUrl + idx} 
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
          
          {/* Show More/Less Button */}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 bg-[linear-gradient(to_right,rgba(147,51,234,0.2),rgba(147,51,234,0.06))] ring-1 ring-purple-500/30 rounded-lg backdrop-blur-sm transition-all duration-200 hover:bg-[linear-gradient(to_right,rgba(147,51,234,0.3),rgba(147,51,234,0.1))] hover:ring-purple-500/50 hover:text-white"
              >
                {showAll ? (
                  <>
                    Show Less
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth={2} 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-4 h-4"
                    >
                      <path d="m18 15-6-6-6 6"/>
                    </svg>
                  </>
                ) : (
                  <>
                    Show More ({currentItems.length - 5} more)
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth={2} 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-4 h-4"
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
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