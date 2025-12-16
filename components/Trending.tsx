"use client";

import Image from "next/image";
import { useState, useRef, useMemo, useEffect, useCallback, memo } from "react";
import type { TrendingItem } from "@/types";
import { AnimeInfoPopup } from "./AnimeInfoPopup";

interface TrendingProps {
  items: TrendingItem[] | null | undefined;
  title?: string;
  loading?: boolean;
}

// Skeleton component for loading state
function TrendingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-40 space-y-2">
            <div className="aspect-[2/3] bg-white/10 rounded-lg animate-pulse" />
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingComponent({
  items,
  title = "Trending",
  loading = false,
}: TrendingProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentAnime, setCurrentAnime] = useState<TrendingItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, []);

  // Show skeleton when loading or no items
  if (loading || !items) {
    return <TrendingSkeleton />;
  }

  // Pre-process items: group all candidates per rank (1..10) then pick the best for each rank.
  // "Best" means: exact qtip.title match (case-insensitive) > has qtip with description > any qtip > fallback first.
  const processedItems = useMemo(() => {
    const rankGroups: Record<number, TrendingItem[]> = {};
    const parseRank = (r: string | undefined) => {
      if (!r) return NaN;
      const n = parseInt(r.replace(/[^0-9]/g, ""), 10);
      return Number.isFinite(n) ? n : NaN;
    };

    for (const raw of items) {
      if (!raw) continue;
      const num = parseRank(raw.rank);
      if (!num || num < 1 || num > 10) continue;
      if (!rankGroups[num]) rankGroups[num] = [];
      rankGroups[num].push(raw);
    }

    const chooseBest = (candidates: TrendingItem[]): TrendingItem | null => {
      if (!candidates || !candidates.length) return null;
      // exact match with description
      const exact = candidates.find(
        (c) =>
          c.qtip &&
          c.qtip.title &&
          c.title &&
          c.qtip.title.trim().toLowerCase() === c.title.trim().toLowerCase() &&
          !!c.qtip.description
      );
      if (exact) return exact;
      // exact match (no description requirement)
      const exactNoDesc = candidates.find(
        (c) =>
          c.qtip &&
          c.qtip.title &&
          c.title &&
          c.qtip.title.trim().toLowerCase() === c.title.trim().toLowerCase()
      );
      if (exactNoDesc) return exactNoDesc;
      // has qtip with description
      const withDesc = candidates.find((c) => c.qtip && c.qtip.description);
      if (withDesc) return withDesc;
      // any qtip
      const anyQtip = candidates.find((c) => c.qtip);
      if (anyQtip) return anyQtip;
      return candidates[0];
    };

    const ordered: TrendingItem[] = [];
    for (let r = 1; r <= 10; r++) {
      const best = chooseBest(rankGroups[r] || []);
      if (best) ordered.push(best);
    }
    return ordered;
  }, [items]);

  const itemsPerView = 6;
  const maxIndex = Math.max(0, processedItems.length - itemsPerView);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, anime: TrendingItem) => {
      if (!anime.qtip) return;

      // Soft validation: log mismatches but still show popup (previously we blocked which hid rank 10 popup)
      if (anime.qtip.title && anime.title) {
        const qtipTitle = anime.qtip.title.toLowerCase().trim();
        const animeTitle = anime.title.toLowerCase().trim();
        if (qtipTitle !== animeTitle) {
          console.debug(
            `[Trending] qtip/title mismatch: card="${anime.title}" qtip.title="${anime.qtip.title}"`
          );
        }
      }

      // Clear any pending timeouts
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setPopupPosition({ x, y });
      setCurrentAnime(anime);
      // Small delay before showing
      showTimeoutRef.current = setTimeout(() => {
        setShowPopup(true);
      }, 150);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    // Add a delay before hiding to allow moving to popup
    hideTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
      setCurrentAnime(null);
    }, 150);
  }, []);

  const handlePopupMouseEnter = useCallback(() => {
    // Keep popup visible when hovering over it
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handlePopupMouseLeave = useCallback(() => {
    // Hide popup when leaving popup area
    setShowPopup(false);
    setCurrentAnime(null);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = 210; // card width + gap (200px + 10px gap)
      scrollContainerRef.current.scrollTo({
        left: index * itemWidth,
        behavior: "smooth",
      });
    }
  }, []);

  const handlePrevious = useCallback(() => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  }, [currentIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    setCurrentIndex(newIndex);
    scrollToIndex(newIndex);
  }, [currentIndex, maxIndex, scrollToIndex]);

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
        <div className="relative lg:px-12">
          {/* Left Arrow - Outside container (hidden on mobile/tablet) */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="hidden lg:block absolute -left-6 top-1/2 -translate-y-1/2 z-10 w-8 h-8 text-white/70 hover:cursor-pointer hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Right Arrow - Outside container (hidden on mobile/tablet) */}
          <button
            onClick={handleNext}
            disabled={currentIndex >= maxIndex}
            className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 z-10 w-8 h-8 text-white/70 hover:cursor-pointer hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto lg:overflow-hidden scrollbar-hide touch-pan-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {processedItems.map((anime, idx) => {
              const linkUrl = anime.url;
              const posterUrl = anime.poster;
              // Prefer anime.rank (normalize to two digits); fallback to position if missing
              const numericRank = parseInt(anime.rank.replace(/[^0-9]/g, ""));
              const displayRank = Number.isFinite(numericRank)
                ? String(numericRank).padStart(2, "0")
                : String(idx + 1).padStart(2, "0");

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
                  <a
                    href={linkUrl}
                    className="block relative h-[240px] w-[160px] overflow-hidden bg-black/20"
                    onMouseEnter={(e) => handleMouseEnter(e, anime)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Image
                      src={posterUrl}
                      alt={anime.title}
                      fill
                      priority={idx < 3}
                      sizes="160px"
                      className="object-cover transition-transform duration-300"
                    />
                  </a>
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
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
        />
      )}
    </>
  );
}

// Memoize to prevent re-renders when parent updates
export const Trending = memo(TrendingComponent);
