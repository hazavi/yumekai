"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { AnimeCardData } from "@/lib/api";
import { AnimeInfoPopup } from "./AnimeInfoPopup";

interface LatestEpisodeProps {
  anime: AnimeCardData & { latest_episode?: string; dub?: string; duration?: string };
  showMeta?: boolean;
}

export function LatestEpisode({ anime, showMeta = true }: LatestEpisodeProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null); // no delay now

  const slug = anime.link;

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!anime.qtip) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setPopupPosition({ x, y });
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowPopup(false);
  };

  const handleImageMouseEnter = (e: React.MouseEvent) => {
    handleMouseEnter(e);
  };

  const handleImageMouseLeave = () => {
    handleMouseLeave();
  };

  return (
    <>
      <div 
        ref={cardRef}
        className="relative"
      >
      <div 
        className="relative overflow-hidden bg-black/20 backdrop-blur-sm group"
        onMouseEnter={handleImageMouseEnter}
        onMouseLeave={handleImageMouseLeave}
      >
        <Link href={slug} className="block aspect-[3/4] relative">
          <Image
            src={anime.thumbnail}
            alt={anime.title}
            fill
            sizes="(max-width:768px) 40vw, (max-width:1200px) 20vw, 15vw"
            className="object-cover transition-all duration-300 group-hover:blur-sm"
          />
          
          {/* Play button overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110">
              <Image
                src="/playbutton.svg"
                alt="Play"
                width={32}
                height={32}
                className="ml-1 filter brightness-0 invert"
              />
            </div>
          </div>
          
          {/* Bottom black vignette */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          
          {/* Sub/Dub badges at bottom left - matching carousel style */}
          {(anime.dub || anime.latest_episode) && (
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              {/* SUB badge with CC icon and episode number */}
              <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium bg-[linear-gradient(to_right,rgba(147,51,234,0.25),rgba(147,51,234,0.08))] ring-1 ring-purple-500/40 text-purple-200 shadow-[0_0_0_1px_rgba(147,51,234,0.2)] backdrop-blur-sm">
                <img src="/cc.svg" alt="CC" className="w-3.5 h-3.5 brightness-0 invert" />
                {anime.latest_episode || 'SUB'}
              </span>
              {/* DUB badge with mic icon */}
              {anime.dub && (
                <span className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium bg-[linear-gradient(to_right,rgba(16,185,129,0.25),rgba(16,185,129,0.08))] ring-1 ring-emerald-500/40 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.25)] backdrop-blur-sm">
                  <img src="/mic.svg" alt="MIC" className="w-3.5 h-3.5 brightness-0 invert" />
                   {anime.dub}
                </span>
              )}
            </div>
          )}
        </Link>
      </div>
      {showMeta && (
        <div className="mt-2 px-1">
          <Link 
            href={slug} 
            className="block text-sm font-medium text-white/90 truncate hover:text-white transition-colors"
            title={anime.title}
          >
            {anime.title}
          </Link>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-white/60">
            {anime.type && <span className="uppercase tracking-wide">{anime.type}</span>}
            {anime.type && anime.duration && <span>•</span>}
            {anime.duration && <span>{anime.duration}</span>}
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
    />
  </>
  );
}