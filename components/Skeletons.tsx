"use client";

import { memo } from "react";

// Anime Card Skeleton
export const AnimeCardSkeleton = memo(function AnimeCardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="aspect-[2/3] bg-white/10 rounded-lg animate-pulse" />
      <div className="space-y-1.5">
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="flex gap-1.5">
          <div className="h-5 w-10 bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-8 bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-8 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
});

// Anime Grid Skeleton
interface AnimeGridSkeletonProps {
  count?: number;
  className?: string;
}

export const AnimeGridSkeleton = memo(function AnimeGridSkeleton({
  count = 12,
  className = "",
}: AnimeGridSkeletonProps) {
  return (
    <div
      className={`grid gap-4 grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <AnimeCardSkeleton key={i} />
      ))}
    </div>
  );
});

// Hero Carousel Skeleton
export const HeroCarouselSkeleton = memo(function HeroCarouselSkeleton() {
  return (
    <div className="relative w-full h-[60vh] md:h-[70vh] bg-gradient-to-b from-gray-900/30 to-black overflow-hidden">
      <div className="absolute inset-0 bg-white/5 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Content skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 space-y-4">
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
        <div className="h-10 w-3/4 max-w-xl bg-white/10 rounded animate-pulse" />
        <div className="space-y-2 max-w-2xl">
          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex gap-3 pt-2">
          <div className="h-12 w-32 bg-white/10 rounded-full animate-pulse" />
          <div className="h-12 w-32 bg-white/10 rounded-full animate-pulse" />
        </div>
        {/* Dots skeleton */}
        <div className="flex gap-2 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-2 w-2 bg-white/20 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
});

// Trending Section Skeleton
export const TrendingSkeleton = memo(function TrendingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-40 space-y-2">
            <div className="aspect-[2/3] bg-white/10 rounded-lg animate-pulse" />
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
});

// Top Anime Sidebar Skeleton
export const TopAnimeSkeleton = memo(function TopAnimeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-6 w-14 bg-white/10 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse flex-shrink-0" />
            <div className="w-12 h-16 bg-white/10 rounded animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Section Header Skeleton
export const SectionHeaderSkeleton = memo(function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
      <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
    </div>
  );
});

// Latest Episode Card Skeleton
export const LatestEpisodeCardSkeleton = memo(
  function LatestEpisodeCardSkeleton() {
    return (
      <div className="flex gap-3 p-3 bg-white/5 rounded-lg">
        <div className="w-16 h-20 bg-white/10 rounded animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-5 w-12 bg-white/10 rounded animate-pulse" />
            <div className="h-5 w-16 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
);

// Latest Episode Grid Skeleton
export const LatestEpisodeGridSkeleton = memo(
  function LatestEpisodeGridSkeleton({ count = 12 }: { count?: number }) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <LatestEpisodeCardSkeleton key={i} />
        ))}
      </div>
    );
  }
);

// Genres Skeleton
export const GenresSkeleton = memo(function GenresSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-20 bg-white/10 rounded animate-pulse" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 bg-white/10 rounded-full animate-pulse"
          />
        ))}
      </div>
    </div>
  );
});

// Schedule Card Skeleton
export const ScheduleCardSkeleton = memo(function ScheduleCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-white/5 rounded-lg">
      <div className="w-20 h-28 bg-white/10 rounded animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 bg-white/10 rounded animate-pulse" />
          <div className="h-6 w-20 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
});

// Schedule Section Skeleton
export const ScheduleSkeleton = memo(function ScheduleSkeleton() {
  return (
    <div className="space-y-6">
      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 bg-white/10 rounded-lg animate-pulse flex-shrink-0"
          />
        ))}
      </div>
      {/* Schedule cards */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ScheduleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
});

// Search Results Skeleton
export const SearchResultsSkeleton = memo(function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
      <AnimeGridSkeleton count={12} />
    </div>
  );
});

// Pagination Skeleton
export const PaginationSkeleton = memo(function PaginationSkeleton() {
  return (
    <div className="flex justify-center gap-2 py-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 w-10 bg-white/10 rounded animate-pulse" />
      ))}
    </div>
  );
});

// User Profile Skeleton
export const UserProfileSkeleton = memo(function UserProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-white/10 rounded-full animate-pulse" />
        <div className="space-y-3">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      {/* Stats */}
      <div className="flex gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="h-8 w-12 bg-white/10 rounded animate-pulse mx-auto" />
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-white/10 rounded animate-pulse" />
        ))}
      </div>
      {/* Content */}
      <AnimeGridSkeleton count={6} />
    </div>
  );
});

// Watch Page Skeleton
export const WatchPageSkeleton = memo(function WatchPageSkeleton() {
  return (
    <div className="min-h-screen pt-16">
      {/* Video player skeleton */}
      <div className="w-full aspect-video bg-white/5 animate-pulse" />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title */}
            <div className="space-y-3">
              <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse" />
              <div className="h-5 w-1/2 bg-white/10 rounded animate-pulse" />
            </div>

            {/* Episode navigation */}
            <div className="flex gap-3">
              <div className="h-10 w-24 bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-24 bg-white/10 rounded animate-pulse" />
            </div>

            {/* Episode list */}
            <div className="space-y-2">
              <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-white/10 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="h-6 w-40 bg-white/10 rounded animate-pulse" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-24 h-16 bg-white/10 rounded animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Full Page Section Skeleton (for list pages like top-airing, most-popular, etc.)
export const ListPageSkeleton = memo(function ListPageSkeleton() {
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main content */}
          <div className="xl:col-span-9 space-y-6">
            <SectionHeaderSkeleton />
            <AnimeGridSkeleton count={18} />
            <PaginationSkeleton />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-3 space-y-6">
            <TopAnimeSkeleton />
            <GenresSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
});

// Home Page Skeleton
export const HomePageSkeleton = memo(function HomePageSkeleton() {
  return (
    <div className="min-h-screen">
      <HeroCarouselSkeleton />

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Trending */}
        <TrendingSkeleton />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main content */}
          <div className="xl:col-span-9 space-y-12">
            {/* Latest Episodes */}
            <div className="space-y-4">
              <SectionHeaderSkeleton />
              <LatestEpisodeGridSkeleton count={8} />
            </div>

            {/* Recently Added */}
            <div className="space-y-4">
              <SectionHeaderSkeleton />
              <AnimeGridSkeleton count={6} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-3 space-y-6">
            <TopAnimeSkeleton />
            <GenresSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
});

// Featured Anime Card Skeleton (for the first 4 items in AnimeListTemplate)
export const FeaturedAnimeCardSkeleton = memo(
  function FeaturedAnimeCardSkeleton() {
    return (
      <div className="relative">
        <div className="relative overflow-hidden bg-black/20 backdrop-blur-sm">
          <div className="aspect-[3/4] bg-white/10 animate-pulse" />
        </div>
        {/* Title and Meta Info */}
        <div className="mt-2 px-1 space-y-2">
          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
          {/* Description skeleton */}
          <div className="space-y-1">
            <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-4/6 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-8 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-1 bg-white/10 rounded animate-pulse" />
            <div className="h-3 w-10 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }
);

// Top Anime Categories Skeleton (for sidebar)
export const TopAnimeCategoriesSkeleton = memo(
  function TopAnimeCategoriesSkeleton() {
    return (
      <div className="space-y-4">
        {/* Category tabs */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-white/10 rounded animate-pulse"
            />
          ))}
        </div>
        {/* Anime list */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-12 h-16 bg-white/10 rounded animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-5 w-10 bg-white/10 rounded animate-pulse" />
                  <div className="h-5 w-8 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

// AnimeListTemplate Skeleton (matches the exact layout of AnimeListTemplate component)
export const AnimeListTemplateSkeleton = memo(
  function AnimeListTemplateSkeleton() {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <div className="h-9 w-48 bg-white/10 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* First 4 anime in one row (Featured) */}
              <div className="mb-12">
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <FeaturedAnimeCardSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Rest of the anime in 6 per row grid format */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3 md:gap-4">
                {Array.from({ length: 18 }).map((_, i) => (
                  <AnimeCardSkeleton key={i} />
                ))}
              </div>

              {/* Pagination */}
              <PaginationSkeleton />
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1 space-y-8">
              {/* TopAnime Component */}
              <TopAnimeSkeleton />

              {/* TopAnimeCategories Component */}
              <TopAnimeCategoriesSkeleton />

              {/* Genres Component */}
              <GenresSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
