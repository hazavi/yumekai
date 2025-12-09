"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { QtipData } from "@/types";
import { AddToListButton } from "./AddToListButton";

interface AnimeInfoPopupProps {
  qtip: QtipData;
  poster: string;
  slug: string;
  isVisible: boolean;
  position: { x: number; y: number };
  isSidebar?: boolean;
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
  onMouseEnter,
  onMouseLeave,
}: AnimeInfoPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseEnter = () => {
      if (onMouseEnter) onMouseEnter();
    };

    const handleMouseLeave = () => {
      if (onMouseLeave) onMouseLeave();
    };

    const popup = popupRef.current;
    if (popup) {
      popup.addEventListener("mouseenter", handleMouseEnter);
      popup.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        popup.removeEventListener("mouseenter", handleMouseEnter);
        popup.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [onMouseEnter, onMouseLeave]);

  if (!isVisible || !qtip) return null;

  // Calculate if popup should appear above or below based on screen position
  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 1000;
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1000;
  const popupHeight = 400; // Approximate popup height
  const popupWidth = 320; // 80 * 4 = 320px (w-80)
  const margin = 20; // Minimum margin from edges

  const shouldPositionAbove =
    position.y + popupHeight / 2 > viewportHeight - 50;

  // Adjust horizontal position based on whether it's sidebar or grid
  let adjustedX = position.x;

  if (isSidebar) {
    // For sidebar: center on item but shift slightly to the left
    adjustedX = position.x - 220; // Shift 80px to the left from center

    // Ensure popup doesn't go off left edge
    if (adjustedX < margin) {
      adjustedX = margin;
    }
    // Ensure popup doesn't go off right edge
    if (adjustedX + popupWidth > viewportWidth - margin) {
      adjustedX = viewportWidth - margin - popupWidth;
    }
  } else {
    // For grid: center on item but shift slightly to the left
    adjustedX = position.x - 80; // Shift 80px to the left from center

    // Ensure popup doesn't go off left edge
    if (adjustedX < margin) {
      adjustedX = margin;
    }
    // Ensure popup doesn't go off right edge
    if (adjustedX + popupWidth > viewportWidth - margin) {
      adjustedX = viewportWidth - margin - popupWidth;
    }
  }

  return (
    <div
      ref={popupRef}
      className="fixed z-50"
      style={{
        left: adjustedX,
        top: position.y,
        transform: shouldPositionAbove
          ? "translate(0, calc(-100% - 10px))"
          : "translate(0, 10px)",
      }}
    >
      <div className="w-80 bg-black/60 backdrop-blur-xl rounded-md shadow-2xl border border-white/10">
        {/* Header with title */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg leading-tight truncate">
            {qtip.title}
          </h3>
        </div>

        {/* Content */}
        <div className="p-4 pt-0 space-y-3">
          {/* Rating, Quality, Sub/Dub, Type - all in one row */}
          <div className="flex items-center gap-2 text-xs">
            {/* Always show rating */}
            <span className="px-2 py-1 font-medium flex items-center gap-1">
              <Image
                src="/star.svg"
                alt="star"
                width={20}
                height={20}
                className="star"
              />
              {qtip.rating || "N/A"}
            </span>

            {/* Quality */}
            {qtip.quality && (
              <span className="px-2 py-1 bg-[linear-gradient(to_right,rgba(59,130,246,0.25),rgba(59,130,246,0.08))] ring-1 ring-blue-500/40 text-blue-200 shadow-[0_0_0_1px_rgba(59,130,246,0.2)] backdrop-blur-sm rounded-full font-medium">
                {qtip.quality}
              </span>
            )}

            {/* Sub badge */}
            {qtip.sub && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-[linear-gradient(to_right,rgba(147,51,234,0.25),rgba(147,51,234,0.08))] ring-1 ring-purple-500/40 text-purple-200 shadow-[0_0_0_1px_rgba(147,51,234,0.2)] backdrop-blur-sm">
                <Image
                  src="/cc.svg"
                  alt="CC"
                  width={15}
                  height={15}
                  className="brightness-0 invert"
                />
                {qtip.sub}
              </span>
            )}

            {/* Dub badge */}
            {qtip.dub && qtip.dub !== "0" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-[linear-gradient(to_right,rgba(16,185,129,0.25),rgba(16,185,129,0.08))] ring-1 ring-emerald-500/40 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] backdrop-blur-sm">
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
              <span className="px-2 py-1 bg-[linear-gradient(to_right,rgba(236,72,153,0.25),rgba(236,72,153,0.08))] ring-1 ring-pink-500/40 text-pink-200 shadow-[0_0_0_1px_rgba(236,72,153,0.2)] backdrop-blur-sm rounded-full font-medium">
                {qtip.type}
              </span>
            )}
          </div>

          {/* Description */}
          {qtip.description && (
            <div className="text-xs text-white/80 leading-relaxed">
              <p
                className="overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {qtip.description}
              </p>
            </div>
          )}

          {/* Japanese title */}
          {qtip.japanese && (
            <div className="text-xs text-white/70">
              <span className="font-medium">Japanese: </span>
              {qtip.japanese}
            </div>
          )}

          {/* Synonyms */}
          {qtip.synonyms && (
            <div className="text-xs text-white/70">
              <span className="font-medium">Synonyms: </span>
              {qtip.synonyms}
            </div>
          )}

          {/* Aired date */}
          {qtip.aired && (
            <div className="text-xs text-white/70">
              <span className="font-medium">Aired: </span>
              {qtip.aired}
            </div>
          )}

          {/* Status */}
          {qtip.status && (
            <div className="text-xs text-white/70">
              <span className="font-medium">Status: </span>
              <span className="px-2 py-0.5 bg-white/10 text-white/80 text-[10px] rounded-full">
                {qtip.status}
              </span>
            </div>
          )}

          {/* Genres */}
          {qtip.genres && qtip.genres.length > 0 && (
            <div className="text-xs text-white/70">
              <div className="flex flex-wrap gap-1 mt-1">
                {qtip.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-white/10 text-white/80 text-[10px] rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Watch Now Button */}
        <div className="p-4 pt-0 flex items-center gap-2">
          <a href={qtip.watch_url || slug} className="block flex-1">
            <button className="w-full bg-white hover:bg-gray-100 text-black font-semibold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center gap-2 hover:cursor-pointer">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch Now
            </button>
          </a>
          <AddToListButton
            anime={{
              animeId: slug,
              title: qtip.title || "",
              poster: poster,
            }}
            variant="icon"
            className="flex-shrink-0 h-[48px] w-[48px] flex items-center justify-center"
          />
        </div>
      </div>
    </div>
  );
}
