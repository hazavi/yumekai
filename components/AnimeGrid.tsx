import { AnimeCard } from "./AnimeCard";
import { AnimeCardData } from "@/lib/api";

interface AnimeGridProps<T extends AnimeCardData> {
  items: (T & { latest_episode?: string; dub?: string; duration?: string })[];
  emptyLabel?: string;
  className?: string;
  badgeType?: 'latest' | 'recent' | 'upcoming';
}

export function AnimeGrid<T extends AnimeCardData>({ items, emptyLabel = "No anime found", className = "", badgeType = 'latest' }: AnimeGridProps<T>) {
  if (!items?.length) {
    return <div className="text-sm text-white/50 italic">{emptyLabel}</div>;
  }
  return (
    <div className={`grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 ${className}`}>
      {items.map(item => (
        <AnimeCard key={item.link} anime={item} badgeType={badgeType} />
        
      ))}
    </div>
  );
}