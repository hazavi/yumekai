"use client";

import { SectionGrid } from "./SectionGrid";
import { AnimeCardData } from "@/lib/api";

interface LatestEpisodeGridProps {
  anime: (AnimeCardData & { latest_episode?: string; dub?: string; duration?: string })[];
}

export function LatestEpisodeGrid({ anime }: LatestEpisodeGridProps) {
  return (
    <SectionGrid
      title="Latest Episodes"
      href="/recently-updated"
      anime={anime}
      badgeType="latest"
      emptyLabel="No recent episodes."
    />
  );
}