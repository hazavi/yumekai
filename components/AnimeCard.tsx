"use client";

import Image from "next/image";
import { useState, useRef, useEffect, memo, useCallback } from "react";
import type { AnimeCardData } from "@/types";
import { AnimeInfoPopup } from "./AnimeInfoPopup";

interface AnimeCardProps {
  anime: AnimeCardData & {
    latest_episode?: string;
    dub?: string;
    duration?: string;
  };
  showMeta?: boolean;
  badgeType?: "latest" | "recent" | "upcoming";
}

function AnimeCardComponent({
  anime,
  showMeta = true,
  badgeType = "latest",
}: AnimeCardProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slug = anime.link;

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (!anime.qtip) return;

      // Clear any pending hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      // Clear any pending show timeout
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setPopupPosition({ x, y });

      // Small delay before showing to prevent flickering on quick hover
      showTimeoutRef.current = setTimeout(() => {
        setShowPopup(true);
      }, 150);
    },
    [anime.qtip]
  );

  const handleMouseLeave = useCallback(() => {
    // Clear show timeout if still pending
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    // Add a delay before hiding to allow moving to popup
    hideTimeoutRef.current = setTimeout(() => {
      setShowPopup(false);
    }, 300);
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
  }, []);

  return (
    <>
      <div ref={cardRef} className="relative">
        <div
          className="relative overflow-hidden bg-black/20 backdrop-blur-sm group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <a href={slug} className="block aspect-[3/4] relative">
            <Image
              src={anime.thumbnail}
              alt={anime.title}
              fill
              sizes="(max-width:640px) 33vw, (max-width:768px) 25vw, (max-width:1024px) 16vw, 12vw"
              className="object-cover transition-all duration-300 group-hover:blur-sm"
              loading="lazy"
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

            {/* Dynamic badges based on badge type */}
            {badgeType !== "upcoming" &&
              (anime.dub || anime.latest_episode) && (
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  {/* SUB badge with CC icon and episode number */}
                  <span className="badge badge-purple pl-1.5 pr-2 py-0.5 text-[11px]">
                    <Image
                      src="/cc.svg"
                      alt="CC"
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 brightness-0 invert"
                    />
                    {anime.latest_episode || "SUB"}
                  </span>
                  {/* DUB badge with mic icon */}
                  {anime.dub && (
                    <span className="badge badge-emerald pl-1.5 pr-2 py-0.5 text-[11px]">
                      <Image
                        src="/mic.svg"
                        alt="Mic"
                        width={14}
                        height={14}
                        className="w-3.5 h-3.5 brightness-0 invert"
                      />
                      {anime.dub}
                    </span>
                  )}
                </div>
              )}
          </a>
        </div>
        {showMeta && (
          <div className="mt-2 px-1">
            <a
              href={slug}
              className="block text-sm font-medium text-white/90 truncate hover:text-white transition-colors"
              title={anime.title}
            >
              {anime.title}
            </a>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-white/60">
              {badgeType === "latest" && (
                <>
                  {anime.type && (
                    <span className="uppercase tracking-wide">
                      {anime.type}
                    </span>
                  )}
                  {anime.type && anime.duration && <span>•</span>}
                  {anime.duration && <span>{anime.duration}</span>}
                </>
              )}
              {badgeType === "recent" && (
                <>
                  {anime.type && (
                    <span className="uppercase tracking-wide">
                      {anime.type}
                    </span>
                  )}
                  {anime.type && anime.duration && <span>•</span>}
                  {anime.duration && <span>{anime.duration}</span>}
                </>
              )}
              {badgeType === "upcoming" && (
                <>
                  {anime.type && (
                    <span className="uppercase tracking-wide">
                      {anime.type}
                    </span>
                  )}
                  {anime.type && anime.qtip?.eps && <span>•</span>}
                  {anime.qtip?.eps && <span>{anime.qtip.eps} episodes</span>}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Anime Info Popup */}
      <AnimeInfoPopup
        qtip={anime.qtip!}
        poster={anime.thumbnail}
        slug={slug}
        isVisible={showPopup}
        position={popupPosition}
        badgeType={badgeType}
        onMouseEnter={handlePopupMouseEnter}
        onMouseLeave={handlePopupMouseLeave}
      />
    </>
  );
}

// Memoize to prevent re-renders when parent re-renders with same props
export const AnimeCard = memo(AnimeCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.anime.link === nextProps.anime.link &&
    prevProps.anime.title === nextProps.anime.title &&
    prevProps.anime.thumbnail === nextProps.anime.thumbnail &&
    prevProps.badgeType === nextProps.badgeType &&
    prevProps.showMeta === nextProps.showMeta
  );
});
