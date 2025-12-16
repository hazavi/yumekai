"use client";

import { memo } from "react";

// Anime Card Skeleton
const AnimeCardSkeleton = memo(function AnimeCardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="aspect-[2/3] bg-white/10 rounded-lg animate-pulse" />
      <div className="space-y-1.5">
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        <div className="flex gap-1.5">
          <div className="h-5 w-10 bg-white/10 rounded animate-pulse" />
          <div className="h-5 w-8 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
});

// Featured Anime Card Skeleton
const FeaturedAnimeCardSkeleton = memo(function FeaturedAnimeCardSkeleton() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden bg-black/20 backdrop-blur-sm">
        <div className="aspect-[3/4] bg-white/10 animate-pulse" />
      </div>
      <div className="mt-2 px-1 space-y-2">
        <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
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
});

// Pagination Skeleton
const PaginationSkeleton = memo(function PaginationSkeleton() {
  return (
    <div className="flex justify-center gap-2 py-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 w-10 bg-white/10 rounded animate-pulse" />
      ))}
    </div>
  );
});

// Top Anime Skeleton
const TopAnimeSkeleton = memo(function TopAnimeSkeleton() {
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

// Top Anime Categories Skeleton
const TopAnimeCategoriesSkeleton = memo(function TopAnimeCategoriesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-white/10 rounded animate-pulse" />
        ))}
      </div>
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
});

// Genres Skeleton
const GenresSkeleton = memo(function GenresSkeleton() {
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

// Main AnimeListTemplate Skeleton Component
export default function AnimeListTemplateSkeleton() {
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
            <TopAnimeSkeleton />
            <TopAnimeCategoriesSkeleton />
            <GenresSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
