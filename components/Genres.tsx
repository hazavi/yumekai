"use client";
import { useState } from "react";
import type { Genre } from "@/models";

interface GenresProps {
  genres: Genre[];
  title?: string;
  initialCount?: number;
}

export function Genres({ genres, title = "Genres", initialCount = 12 }: GenresProps) {
  const [showAll, setShowAll] = useState(false);

  if (!genres?.length) {
    return (
      <div className="px-5 py-5 w-full">
        <h3 className="text-xl font-semibold text-white/95 mb-5">{title}</h3>
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <div className="text-sm text-white/60">No genres available</div>
        </div>
      </div>
    );
  }

  const visibleGenres = showAll ? genres : genres.slice(0, initialCount);
  const hasMore = genres.length > initialCount;

  return (
    <div className="px-5 py-5 w-full">
      <h3 className="text-xl font-semibold text-white/95 mb-5">{title}</h3>
      
      <div className="bg-[#1a1a1a] rounded-lg p-4">
        {/* Genre Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
        {visibleGenres.map((genre) => (
          <a
            key={genre.slug}
            href={genre.url}
            className="group relative px-2 py-2 text-xs font-medium text-white/80 bg-[linear-gradient(to_right,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] ring-1 ring-white/10 rounded-lg backdrop-blur-sm transition-all duration-200 hover:bg-[linear-gradient(to_right,rgba(147,51,234,0.25),rgba(147,51,234,0.08))] hover:ring-purple-500/40 hover:text-white"
          >
            <span className="block text-center leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{genre.name}</span>
          </a>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="flex justify-center">
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
                Show More ({genres.length - initialCount} more)
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
      </div>
    </div>
  );
}