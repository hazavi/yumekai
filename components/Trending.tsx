"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useMemo } from "react";
import type { TrendingItem } from "@/lib/api";
import { AnimeInfoPopup } from "./AnimeInfoPopup";

interface TrendingProps { items: TrendingItem[]; title?: string; }

export function Trending({ items, title = "Trending" }: TrendingProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentAnime, setCurrentAnime] = useState<TrendingItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null); // will be unused after instant show but kept for safety
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Pre-process items: dedupe by url (first occurrence), validate & sort by numeric rank ascending
  const processedItems = useMemo(() => {
    // Group by url
    const groups = new Map<string, TrendingItem[]>();
    for (const it of items) {
      if (!it || !it.url) continue;
      const list = groups.get(it.url) || [];
      list.push(it);
      groups.set(it.url, list);
    }
    const picked: TrendingItem[] = [];
    for (const [url, list] of groups) {
      if (list.length === 1) {
        picked.push(list[0]);
        continue;
      }
      // Prefer entry whose qtip.title matches its title (case-insensitive) and has a non-empty qtip.description
      const exact = list.find(l => l.qtip && l.qtip.title && l.title && l.qtip.title.toLowerCase() === l.title.toLowerCase() && l.qtip.description);
      picked.push(exact || list[0]);
    }
    picked.sort((a, b) => {
      const ra = parseInt(a.rank.replace(/[^0-9]/g, "")) || 9999;
      const rb = parseInt(b.rank.replace(/[^0-9]/g, "")) || 9999;
      return ra - rb;
    });
    return picked.slice(0, 12);
  }, [items]);

  const itemsPerView = 6;
  const maxIndex = Math.max(0, processedItems.length - itemsPerView);

  const handleMouseEnter = (e: React.MouseEvent, anime: TrendingItem) => {
    if (!anime.qtip) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setPopupPosition({ x, y });
    setCurrentAnime(anime);
    setShowPopup(true); // instant show
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowPopup(false);
    setCurrentAnime(null);
  };

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = 210; // card width + gap (200px + 10px gap)
      scrollContainerRef.current.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  };

  if (!processedItems?.length) {
    return (
      <section className="container-padded">
        <h2 className="text-2xl font-bold text-white/95 mb-6">{title}</h2>
        <div className="text-sm text-white/60">No trending data available</div>
      </section>
    );
  }

  return (
    <>
      <section className="container-padded">
        <h2 className="text-2xl font-bold text-white/95 mb-6">{title}</h2>
        
        {/* Container with Navigation */}
        <div className="relative px-12">
          {/* Left Arrow - Outside container */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 w-8 h-8 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          {/* Right Arrow - Outside container */}
          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 w-8 h-8 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-hidden"
          >
            {processedItems.map((anime, idx) => {
              const linkUrl = anime.url;
              const posterUrl = anime.poster;
              // Prefer anime.rank (normalize to two digits); fallback to position if missing
              const numericRank = parseInt(anime.rank.replace(/[^0-9]/g, ""));
              const displayRank = Number.isFinite(numericRank) ? String(numericRank).padStart(2, '0') : String(idx + 1).padStart(2, '0');
              
              return (
                <div
                  key={`${linkUrl}-${idx}`}
                  className="relative flex-shrink-0 w-[200px] group flex"
                >
                  {/* Left side - Title and Rank */}
                  <div className="flex flex-col h-[240px] w-8 mr-3">
                    {/* Title - Vertical Text with ellipsis */}
                    <div className="flex-1 overflow-hidden">
                      <div 
                        className="writing-mode-vertical text-white font-bold text-sm tracking-wider transform rotate-180 h-full overflow-hidden cursor-help"
                        title={anime.title}
                      >
                        <span className="block truncate">{anime.title}</span>
                      </div>
                    </div>
                    
                    {/* Rank - Fixed at bottom */}
                    <div className="text-white text-2xl font-bold mt-2">
                      {displayRank}
                    </div>
                  </div>
                  
                  {/* Anime Card - Smaller poster */}
                  <Link 
                    href={linkUrl} 
                    className="block relative h-[240px] w-[160px] overflow-hidden bg-black/20"
                    onMouseEnter={(e) => handleMouseEnter(e, anime)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Image 
                      src={posterUrl} 
                      alt={anime.title} 
                      fill 
                      sizes="160px" 
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Anime Info Popup */}
      {currentAnime && currentAnime.qtip && (
        <AnimeInfoPopup
          qtip={currentAnime.qtip}
          poster={currentAnime.poster}
          slug={currentAnime.url}
          isVisible={showPopup}
          position={popupPosition}
          isSidebar={false}
        />
      )}
    </>
  );
}
