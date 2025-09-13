"use client";

import { SectionGrid } from "./SectionGrid";
import { AnimeCardData } from "@/lib/api";

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