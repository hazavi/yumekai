"use client";

import { memo } from "react";
import { SectionGrid } from "./SectionGrid";
import type { AnimeCardData } from "@/types";

interface RecentlyAddedProps {
  anime: AnimeCardData[];
}

function RecentlyAddedComponent({ anime }: RecentlyAddedProps) {
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

export const RecentlyAdded = memo(RecentlyAddedComponent);
