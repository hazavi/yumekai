"use client";

import { AnimeGrid } from "./AnimeGrid";
import { AnimeCardData } from "@/lib/api";

interface SectionGridProps {
  title: string;
  href: string;
  anime: AnimeCardData[];
  badgeType?: 'latest' | 'recent' | 'upcoming';
  emptyLabel?: string;
}

export function SectionGrid({ title, href, anime, badgeType = 'latest', emptyLabel }: SectionGridProps) {
  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-poppins">{title}</h2>
        <a 
          href={href} 
          className="hidden md:inline-flex items-center text-[12px] font-medium text-fuchsia-300/80 hover:text-fuchsia-200 transition"
        >
          View more <span className="ml-1">›</span>
        </a>
      </div>
      
      {/* Grid */}
      <AnimeGrid 
        items={anime} 
        badgeType={badgeType}
        emptyLabel={emptyLabel}
      />
    </section>
  );
}