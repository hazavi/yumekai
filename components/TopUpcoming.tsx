"use client";

import { SectionGrid } from "./SectionGrid";
import type { AnimeCardData } from "@/types";

interface TopUpcomingProps {
  anime: AnimeCardData[];
}

export function TopUpcoming({ anime }: TopUpcomingProps) {
  return (
    <SectionGrid
      title="Top Upcoming"
      href="/top-upcoming"
      anime={anime}
      badgeType="upcoming"
      emptyLabel="No upcoming anime."
    />
  );
}
