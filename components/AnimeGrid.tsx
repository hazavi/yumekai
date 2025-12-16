import { memo } from "react";
import { AnimeCard } from "./AnimeCard";
import { AnimeCardSkeleton } from "./Skeletons";
import type { AnimeCardData } from "@/types";

interface AnimeGridProps<T extends AnimeCardData> {
  items:
    | (T & { latest_episode?: string; dub?: string; duration?: string })[]
    | null
    | undefined;
  emptyLabel?: string;
  className?: string;
  badgeType?: "latest" | "recent" | "upcoming";
  loading?: boolean;
  skeletonCount?: number;
}

function AnimeGridComponent<T extends AnimeCardData>({
  items,
  emptyLabel = "No anime found",
  className = "",
  badgeType = "latest",
  loading = false,
  skeletonCount = 12,
}: AnimeGridProps<T>) {
  // Show skeleton when loading or items is null/undefined
  if (loading || items === null || items === undefined) {
    return (
      <div
        className={`grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 ${className}`}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <div className="text-sm text-white/50 italic">{emptyLabel}</div>;
  }

  return (
    <div
      className={`grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 ${className}`}
    >
      {items.map((item) => (
        <AnimeCard key={item.link} anime={item} badgeType={badgeType} />
      ))}
    </div>
  );
}

// Memoize with generic support
export const AnimeGrid = memo(AnimeGridComponent) as typeof AnimeGridComponent;
