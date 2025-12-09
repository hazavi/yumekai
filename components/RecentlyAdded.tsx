"use client";

import { SectionGrid } from "./SectionGrid";
import type { AnimeCardData } from "@/types";

interface RecentlyAddedProps {
  anime: AnimeCardData[];
}

export function RecentlyAdded({ anime }: RecentlyAddedProps) {
  return (
    <SectionGrid
      title="Recently Added"
      href="/recently-added"
      anime={anime}
      badgeType="recent"
      emptyLabel="No recently added anime."
    />
  );
}
