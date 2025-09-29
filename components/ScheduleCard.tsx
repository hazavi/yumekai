"use client";

import { ScheduleItem } from "@/models";
import { useState } from "react";

interface ScheduleCardProps {
  item: ScheduleItem;
}

export function ScheduleCard({ item }: ScheduleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group relative bg-gradient-to-r from-[#1a1a1a] to-[#1f1f1f] rounded-xl border border-white/5 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.location.href = item.link}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Time Badge */}
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm min-w-[60px] text-center">
            {item.time}
          </div>
        </div>

        {/* Play Button - Shows on Hover before title */}
        <div className={`flex-shrink-0 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100 w-auto' : 'opacity-0 scale-75 w-0'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = item.watch_link;
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <svg 
              className="w-3.5 h-3.5" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>

        {/* Title Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1 leading-relaxed">
            {item.title}
          </h3>
        </div>

        {/* Episode Badge */}
        <div className="flex-shrink-0">
          <span className="bg-white/8 text-white/80 px-3 py-1 rounded-full text-xs font-medium border border-white/10">
            {item.episode}
          </span>
        </div>

        {/* Arrow Indicator */}
        <div className={`flex-shrink-0 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-1'}`}>
          <svg 
            className="w-4 h-4 text-purple-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Hover Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/3 via-purple-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Border Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-sm" />
    </div>
  );
}