"use client";

import { memo } from "react";

// Episode Item Skeleton
const EpisodeItemSkeleton = memo(function EpisodeItemSkeleton() {
  return (
    <div className="group flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-white/[0.03] border border-white/[0.05]">
      {/* Episode Number Badge */}
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/[0.08] animate-pulse flex-shrink-0" />
      {/* Episode Title */}
      <div className="flex-1 min-w-0">
        <div className="h-3 md:h-4 w-3/4 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
  );
});

// Anime Card Skeleton (for recommendations)
const AnimeCardSkeleton = memo(function AnimeCardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="aspect-[3/4] bg-white/10 rounded-xl animate-pulse" />
      <div className="h-3 bg-white/10 rounded w-3/4 animate-pulse" />
    </div>
  );
});

// Main WatchPage Skeleton Component
export default function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Animated background - same as watch page */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]" />
      </div>

      {/* Breadcrumb Skeleton */}
      <div className="py-4 md:py-6 px-3 md:px-6 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <div className="w-10 h-4 bg-white/10 rounded animate-pulse" />
            <div className="w-3 h-3 bg-white/10 rounded animate-pulse mx-1.5 md:mx-3" />
            <div className="w-6 h-4 bg-white/10 rounded animate-pulse" />
            <div className="w-3 h-3 bg-white/10 rounded animate-pulse mx-1.5 md:mx-3" />
            <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
            <div className="w-3 h-3 bg-white/10 rounded animate-pulse mx-1.5 md:mx-3" />
            <div className="w-20 h-4 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-6 py-4 md:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
          {/* Left Sidebar - Episodes List */}
          <div className="xl:col-span-3 order-2 xl:order-1">
            <div className="p-3 md:p-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <div>
                  <div className="h-5 md:h-6 w-20 bg-white/10 rounded animate-pulse mb-1" />
                  <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Sort Toggle Button */}
                  <div className="h-7 w-14 bg-white/5 border border-white/10 rounded-md animate-pulse" />
                  {/* Search Input */}
                  <div className="h-7 w-16 bg-white/5 border border-white/10 rounded-md animate-pulse" />
                </div>
              </div>

              {/* Episode List */}
              <div className="space-y-1 max-h-[300px] md:max-h-[500px] overflow-hidden pr-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <EpisodeItemSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Video Player */}
          <div className="xl:col-span-6 order-1">
            {/* Video Player */}
            <div className="relative group">
              <div className="bg-black shadow-2xl overflow-hidden">
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="w-12 h-12 border-2 border-white/20 border-t-white/50 rounded-full animate-spin" />
                </div>
              </div>
            </div>

            {/* Video Control Bar Skeleton */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-2 md:p-3 shadow-2xl mt-3 md:mt-4">
              <div className="flex flex-row items-center justify-between">
                {/* Left Side - Expand and Lights Controls */}
                <div className="hidden sm:flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse" />
                  <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse" />
                </div>
                {/* Right Side - Episode Navigation */}
                <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                  <div className="w-16 h-8 bg-white/10 rounded-lg border border-white/10 animate-pulse" />
                  <div className="w-16 h-8 bg-white/10 rounded-lg border border-white/10 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Server Selection Panel Skeleton */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 md:p-4 shadow-2xl mt-3 md:mt-4">
              <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-6">
                {/* Left Column - Episode Info */}
                <div className="md:col-span-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg animate-pulse" />
                    <div className="h-4 md:h-5 w-24 bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-48 bg-white/10 rounded animate-pulse" />
                </div>
                {/* Right Column - Server Buttons */}
                <div className="space-y-2 md:space-y-3 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-4 bg-white/10 rounded animate-pulse flex-shrink-0" />
                    <div className="flex gap-2">
                      <div className="w-14 h-7 bg-white/5 rounded-sm border border-white/10 animate-pulse" />
                      <div className="w-14 h-7 bg-white/5 rounded-sm border border-white/10 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-4 bg-white/10 rounded animate-pulse flex-shrink-0" />
                    <div className="flex gap-2">
                      <div className="w-14 h-7 bg-white/5 rounded-sm border border-white/10 animate-pulse" />
                      <div className="w-14 h-7 bg-white/5 rounded-sm border border-white/10 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Anime Details */}
          <div className="xl:col-span-3 order-3">
            <div className="bg-black rounded-xl md:rounded-2xl p-3 md:p-4 shadow-2xl">
              {/* Anime Poster and Title */}
              <div className="mb-3 md:mb-4">
                <div className="flex md:flex-col gap-3 md:gap-0 mb-3 md:mb-4">
                  {/* Poster */}
                  <div className="w-20 h-28 md:w-32 md:h-48 bg-white/10 shadow-lg animate-pulse flex-shrink-0 mb-0 md:mb-4" />
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="h-4 md:h-5 w-full bg-white/10 rounded animate-pulse mb-2 md:mb-3" />
                    <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse mb-2 md:mb-3" />
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-1 mb-2">
                      <div className="w-8 h-4 bg-white/10 rounded-full animate-pulse" />
                      <div className="w-10 h-4 bg-white/10 rounded-full animate-pulse" />
                      <div className="w-12 h-4 bg-white/10 rounded-full animate-pulse" />
                      <div className="w-14 h-4 bg-white/10 rounded-full animate-pulse" />
                      <div className="w-10 h-4 bg-white/10 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-black/80 rounded-lg p-2 md:p-3">
                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
                </div>
              </div>

              {/* Other Seasons */}
              <div className="mt-3 md:mt-4">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-2 md:mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center p-2.5 rounded-xl backdrop-blur-md border border-white/10 bg-black/20"
                    >
                      <div className="w-8 h-12 bg-white/10 rounded mr-3 animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-3 w-full bg-white/10 rounded animate-pulse mb-1" />
                        <div className="h-2 w-2/3 bg-white/10 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="mt-6 md:mt-8">
          <div className="h-6 md:h-8 w-48 bg-white/10 rounded animate-pulse mb-4 md:mb-6" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
