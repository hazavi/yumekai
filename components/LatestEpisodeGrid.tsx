"use client";

import { memo } from "react";
import { SectionGrid } from "./SectionGrid";
import type { AnimeCardData } from "@/types";

interface LatestEpisodeGridProps {
  anime: (AnimeCardData & {
    latest_episode?: string;
    dub?: string;
    duration?: string;
  })[];
}

function LatestEpisodeGridComponent({ anime }: LatestEpisodeGridProps) {
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

export const LatestEpisodeGrid = memo(LatestEpisodeGridComponent);
