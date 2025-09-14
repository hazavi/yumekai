import { HeroCarousel } from "@/components/HeroCarousel";
import { Trending } from "@/components/Trending";
import { LatestEpisodeGrid } from "@/components/LatestEpisodeGrid";
import { RecentlyAdded } from "@/components/RecentlyAdded";
import { TopUpcoming } from "@/components/TopUpcoming";
import { TopAnime } from "@/components/TopAnime";
import { TopAnimeCategories } from "@/components/TopAnimeCategories";
import { Genres } from "@/components/Genres";
import { api } from "@/lib/api";
import type { SpotlightItem, TrendingItem, UpdatedAnime, BasicAnime, TopAnimeData, Genre } from "@/models";
import { Suspense } from "react";

function ensureArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[];
  if (val && typeof val === 'object') {
    // Some endpoints might return an object wrapper unexpectedly; try common keys
    // If it has a 'results' array, use that.
    const maybe = (val as any).results;
    if (Array.isArray(maybe)) return maybe as T[];
  }
  return [];
}

async function fetchHomeData() {
  const [spotlightRaw, trendingRaw, updatedRaw, recentlyAddedRaw, topUpcomingRaw, topAnimeRaw, genresRaw, topAiringRaw, mostPopularRaw, mostFavoriteRaw, completedRaw] = await Promise.all([
    api.spotlightSlider().catch(() => []),
    api.trending().catch(() => []),
    api.recentlyUpdated().then(r => r.results).catch(() => []),
    api.recentlyAdded().then(r => r.results).catch(() => []),
    api.topUpcoming().then(r => r.results).catch(() => []),
    api.topAnime().catch(() => ({ top_today: [], top_week: [], top_month: [] })),
    api.genres().then(r => r.genres).catch(() => []),
    api.topAiring().then(r => r.results).catch(() => []),
    api.mostPopular().then(r => r.results).catch(() => []),
    api.mostFavorite().then(r => r.results).catch(() => []),
    api.completed().then(r => r.results).catch(() => []),
  ]);
  const spotlight = ensureArray<SpotlightItem>(spotlightRaw);
  // Handle trending data - it might be wrapped in { trending: [...] }
  let trending: TrendingItem[] = [];
  if (Array.isArray(trendingRaw)) {
    trending = trendingRaw as TrendingItem[];
  } else if (trendingRaw && typeof trendingRaw === 'object' && Array.isArray((trendingRaw as any).trending)) {
    trending = (trendingRaw as any).trending as TrendingItem[];
  }
  const updated = ensureArray<UpdatedAnime>(updatedRaw);
  const recentlyAdded = ensureArray<BasicAnime>(recentlyAddedRaw);
  const topUpcoming = ensureArray<BasicAnime>(topUpcomingRaw);
  const topAnime = topAnimeRaw as TopAnimeData;
  const genres = ensureArray<Genre>(genresRaw);
  const topAiring = ensureArray<BasicAnime>(topAiringRaw);
  const mostPopular = ensureArray<BasicAnime>(mostPopularRaw);
  const mostFavorite = ensureArray<BasicAnime>(mostFavoriteRaw);
  const completed = ensureArray<BasicAnime>(completedRaw);
  return { spotlight, trending, updated, recentlyAdded, topUpcoming, topAnime, genres, topAiring, mostPopular, mostFavorite, completed };
}

export default async function Home() {
  const { spotlight, trending, updated, recentlyAdded, topUpcoming, topAnime, genres, topAiring, mostPopular, mostFavorite, completed } = await fetchHomeData();
  return (
    <div className="relative">
      <main className="pb-20">
    {/* Hero Full-Bleed */}
  <section className="pt-20">
          <Suspense fallback={<div className="h-[480px] md:h-[540px] glass animate-pulse rounded-none" />}> 
            {spotlight.length ? (
              <HeroCarousel items={spotlight} />
            ) : (
              <div className="h-[480px] md:h-[540px] glass flex items-center justify-center text-sm text-white/50">No spotlight data.</div>
            )}
          </Suspense>
        </section>
        
        {/* Trending Section - pass full list so component can derive ranks 1..10 correctly */}
        <Trending items={trending} />
        
        <div className="container-padded mt-16">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 xl:gap-8 items-start">
            {/* Main content area */}
            <section className="space-y-16">
              {/* Latest Episodes */}
              <LatestEpisodeGrid anime={updated.slice(0,12)} />
              
              {/* Recently Added */}
              <RecentlyAdded anime={recentlyAdded.slice(0,12)} />
              
              {/* Top Upcoming */}
              <TopUpcoming anime={topUpcoming.slice(0,12)} />
            </section>
            {/* Sidebar */}
            <div className="xl:top-24 space-y-6">
              {/* Top Anime */}
              <TopAnime data={topAnime} />
              
              {/* Top Anime Categories */}
              <TopAnimeCategories 
                topAiring={topAiring}
                mostPopular={mostPopular}
                mostFavorite={mostFavorite}
                completed={completed}
              />
              
              {/* Genres */}
              <Genres genres={genres} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}