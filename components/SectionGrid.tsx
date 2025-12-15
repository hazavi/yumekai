"use client";

import { memo } from "react";
import { AnimeGrid } from "./AnimeGrid";
import type { AnimeCardData } from "@/types";

interface SectionGridProps {
  title: string;
  href: string;
  anime: AnimeCardData[];
  badgeType?: "latest" | "recent" | "upcoming";
  emptyLabel?: string;
}

function SectionGridComponent({
  title,
  href,
  anime,
  badgeType = "latest",
  emptyLabel,
}: SectionGridProps) {
  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-poppins">{title}</h2>
        <a
          href={href}
          className="inline-flex items-center text-[11px] md:text-[12px] font-medium text-purple-500/80 hover:text-purple-500 transition"
        >
          View more <span className="ml-1">›</span>
        </a>
      </div>

      {/* Grid */}
      <AnimeGrid items={anime} badgeType={badgeType} emptyLabel={emptyLabel} />
    </section>
  );
}

export const SectionGrid = memo(SectionGridComponent);
