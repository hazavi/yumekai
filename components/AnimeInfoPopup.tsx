"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import type { QtipData } from "@/types";
import { AddToListButton } from "./AddToListButton";

interface AnimeInfoPopupProps {
  qtip: QtipData;
  poster: string;
  slug: string;
  isVisible: boolean;
  position: { x: number; y: number };
  isSidebar?: boolean;
  badgeType?: "latest" | "recent" | "upcoming";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function AnimeInfoPopup({
  qtip,
  poster,
  slug,
  isVisible,
  position,
  isSidebar = false,
  badgeType = "latest",
  onMouseEnter,
  onMouseLeave,
}: AnimeInfoPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({
    x: 0,
    y: 0,
    above: false,
  });
  const [isReady, setIsReady] = useState(false);

  // Calculate position with proper viewport boundaries
  const calculatePosition = useCallback(() => {
    if (typeof window === "undefined") return;

    const popupWidth = 320;
    const popupHeight = 420;
    const margin = 16;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;
    let above = false;

    // Horizontal positioning
    if (isSidebar) {
      // For sidebar: position to the left of the item
      x = position.x - popupWidth - 20;

      // If goes off left, try right side
      if (x < margin) {
        x = position.x + 20;
      }
    } else {
      // For grid: center on the item
      x = position.x - popupWidth / 2;
    }

    // Ensure horizontal bounds
    if (x < margin) {
      x = margin;
    }
    if (x + popupWidth > viewportWidth - margin) {
      x = viewportWidth - margin - popupWidth;
    }

    // Vertical positioning
    // Check if popup fits below
    if (y + popupHeight + margin > viewportHeight) {
      // Position above if not enough space below
      above = true;
    }

    setAdjustedPosition({ x, y, above });
    setIsReady(true);
  }, [position.x, position.y, isSidebar]);

  // Recalculate when position changes or becomes visible
  useEffect(() => {
    if (isVisible) {
      setIsReady(false);
      // Use requestAnimationFrame for smoother positioning
      requestAnimationFrame(() => {
        calculatePosition();
      });
    } else {
      setIsReady(false);
    }
  }, [isVisible, calculatePosition]);

  if (!isVisible || !qtip) return null;

  return (
    <div
      ref={popupRef}
      className={`fixed z-[100] transition-opacity duration-150 ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        transform: adjustedPosition.above
          ? "translateY(calc(-100% - 16px))"
          : "translateY(16px)",
        willChange: "transform, opacity",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-80 bg-black/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header with title */}
        <div className="p-4 pb-2">
          <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
            {qtip.title}
          </h3>
        </div>

        {/* Content */}
        <div className="px-4 pb-3 space-y-2.5">
          {/* Rating, Quality, Sub/Dub, Type - all in one row */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Always show rating */}
            <span className="px-2 py-1 font-medium flex items-center gap-1">
              <Image
                src="/star.svg"
                alt="star"
                width={16}
                height={16}
                className="star"
              />
              {qtip.rating || "N/A"}
            </span>

            {/* Quality */}
            {qtip.quality && (
              <span className="badge badge-blue px-2 py-1 text-xs">
                {qtip.quality}
              </span>
            )}

            {/* Sub badge */}
            {qtip.sub && (
              <span className="badge badge-purple px-2 py-1 text-[10px]">
                <Image
                  src="/cc.svg"
                  alt="CC"
                  width={14}
                  height={14}
                  className="brightness-0 invert"
                />
                {qtip.sub}
              </span>
            )}

            {/* Dub badge */}
            {qtip.dub && qtip.dub !== "0" && (
              <span className="badge badge-emerald px-2 py-1 text-[10px]">
                <Image
                  src="/mic.svg"
                  alt="mic"
                  width={12}
                  height={12}
                  className="brightness-0 invert"
                />
                {qtip.dub}
              </span>
            )}

            {/* Type */}
            {qtip.type && (
              <span className="badge badge-pink px-2 py-1 text-xs">
                {qtip.type}
              </span>
            )}
          </div>

          {/* Description */}
          {qtip.description && (
            <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
              {qtip.description}
            </p>
          )}

          {/* Japanese title */}
          {qtip.japanese && (
            <div className="text-xs text-white/60">
              <span className="text-white/40">Japanese: </span>
              <span className="line-clamp-1">{qtip.japanese}</span>
            </div>
          )}

          {/* Aired date */}
          {qtip.aired && (
            <div className="text-xs text-white/60">
              <span className="text-white/40">Aired: </span>
              {qtip.aired}
            </div>
          )}

          {/* Status */}
          {qtip.status && (
            <div className="text-xs flex items-center gap-2">
              <span className="text-white/40">Status:</span>
              <span className="px-2 py-0.5 bg-white/10 text-white/80 text-[10px] rounded-full">
                {qtip.status}
              </span>
            </div>
          )}

          {/* Genres */}
          {qtip.genres && qtip.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {qtip.genres.slice(0, 4).map((genre, index) => (
                <a
                  key={index}
                  href={`/genre/${genre.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] rounded-full hover:bg-white/20 hover:text-white transition-colors"
                >
                  {genre}
                </a>
              ))}
              {qtip.genres.length > 4 && (
                <span className="px-2 py-0.5 text-white/40 text-[10px]">
                  +{qtip.genres.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Watch Now Button - Hidden for upcoming anime */}
        <div className="p-4 pt-2 flex items-center gap-2 border-t border-white/5">
          {badgeType !== "upcoming" ? (
            <a href={qtip.watch_url || slug} className="block flex-1">
              <button className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>
            </a>
          ) : (
            <a href={slug} className="block flex-1">
              <button className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-2.5 px-4 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer">
                View Details
              </button>
            </a>
          )}
          <AddToListButton
            anime={{
              animeId: slug,
              title: qtip.title || "",
              poster: poster,
            }}
            variant="icon"
            className="flex-shrink-0 h-11 w-11 flex items-center justify-center"
          />
        </div>
      </div>
    </div>
  );
}
