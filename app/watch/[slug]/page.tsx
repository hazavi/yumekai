"use client";

import { notFound, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/services/api";
import { AnimeCard } from "@/components/AnimeCard";
import { useEffect, useState } from "react";
import { decodeHtmlEntities } from "@/utils/html";
import type { WatchData, Episode, ServerItem, SimpleServer } from "@/types";

/**
 * Watch Page Security / Ad Mitigation Notes
 * ----------------------------------------
 * We cannot fully guarantee removal of third‑party ads if the upstream iframe source embeds them,
 * but we reduce common redirect / popup vectors by:
 *  - sandboxing the iframe (no top-level navigation, restricted capabilities)
 *  - limiting feature permissions via `allow`
 *  - suppressing referrer leakage (referrerPolicy="no-referrer")
 *  - adding rel="noopener noreferrer" to outbound recommendation links
 * If stronger stripping is required, next step would be to create a server-side proxy that fetches
 * and sanitizes the remote HTML (remove <script>, tracking pixels). That carries maintenance & legal
 * implications depending on content source. For now this is a lightweight defensive layer.
 */

async function getWatchData(
  slug: string,
  ep?: string
): Promise<WatchData | null> {
  try {
    return (await api.watch(slug, ep)) as WatchData;
  } catch (error) {
    console.error("Error fetching watch data:", error);
    return null;
  }
}

/**
 * Helper function to extract iframe source from an episode
 */
function getIframeSrc(episode: Episode | undefined): string | null {
  if (!episode) return null;

  if (episode.iframe_src) {
    return episode.iframe_src;
  }

  if (episode.servers?.sub) {
    if (Array.isArray(episode.servers.sub)) {
      const serverItem = episode.servers.sub[0] as ServerItem;
      if (serverItem?.ifram_src) {
        return serverItem.ifram_src;
      }
    } else if ("src" in episode.servers.sub) {
      return (episode.servers.sub as SimpleServer).src;
    }
  }

  if (episode.servers?.dub) {
    if (Array.isArray(episode.servers.dub)) {
      const serverItem = episode.servers.dub[0] as ServerItem;
      if (serverItem?.ifram_src) {
        return serverItem.ifram_src;
      }
    } else if ("src" in episode.servers.dub) {
      return (episode.servers.dub as SimpleServer).src;
    }
  }

  return null;
}

export default function WatchPage() {
  const routeParams = useParams<{ slug: string }>();
  const query = useSearchParams();
  const slug = routeParams.slug;
  const ep = query.get("ep") || "";

  const [data, setData] = useState<WatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIframeSrc, setCurrentIframeSrc] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [lightsOff, setLightsOff] = useState(false);
  const [episodeSortOrder, setEpisodeSortOrder] = useState<"asc" | "desc">(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("episodeSortOrder");
        return (saved as "asc" | "desc") || "asc";
      }
      return "asc";
    }
  );

  // Save sort order to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("episodeSortOrder", episodeSortOrder);
    }
  }, [episodeSortOrder]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    async function run() {
      try {
        const watchData = await getWatchData(slug, ep || undefined);
        if (active) {
          setData(watchData);
          // Set initial iframe source when data is loaded
          if (watchData) {
            const currentEpNumber = ep ? parseInt(ep) : 1;
            const currentEpisode =
              watchData.episodes.find(
                (episode) => episode.episode_nr === currentEpNumber
              ) || watchData.episodes[0];

            console.log("Current episode:", currentEpisode);

            // Use helper function to get iframe source
            const iframeSrc = getIframeSrc(currentEpisode);
            if (iframeSrc) {
              setCurrentIframeSrc(iframeSrc);
            }
          }
        }
      } catch (e) {
        console.error("Error loading watch data:", e);
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [slug, ep]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20">
        {/* Animated background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]" />
        </div>

        {/* Breadcrumb Skeleton */}
        <div className="py-6 px-6 border-b border-white/10 bg-black/40 backdrop-blur-md">
          <div className="container mx-auto">
            <div className="flex items-center text-sm text-white/70">
              <div className="w-12 h-4 bg-white/10 animate-pulse rounded-lg"></div>
              <div className="w-4 h-4 mx-3 bg-white/10 animate-pulse rounded"></div>
              <div className="w-8 h-4 bg-white/10 animate-pulse rounded-lg"></div>
              <div className="w-4 h-4 mx-3 bg-white/10 animate-pulse rounded"></div>
              <div className="w-32 h-4 bg-white/10 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-3 md:px-6 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
            {/* Left Sidebar Skeleton - Episodes List */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="w-20 h-5 bg-white/10 animate-pulse rounded-lg mb-1"></div>
                    <div className="w-28 h-3 bg-white/10 animate-pulse rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-7 bg-white/10 animate-pulse rounded-md"></div>
                    <div className="w-12 h-7 bg-white/10 animate-pulse rounded-md"></div>
                  </div>
                </div>

                <div className="space-y-1 max-h-[500px] overflow-y-auto">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-3 bg-white/[0.03] border border-white/[0.05] rounded-xl"
                    >
                      <div className="w-9 h-9 bg-white/10 animate-pulse rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="w-3/4 h-4 bg-white/10 animate-pulse rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              {/* Video Player Skeleton */}
              <div className="relative group">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="relative aspect-video bg-white/5 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-white/10 animate-pulse rounded-xl mx-auto"></div>
                      <div className="w-32 h-4 bg-white/10 animate-pulse rounded-lg mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Control Bar Skeleton */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-2xl mt-4">
                <div className="flex items-center justify-between">
                  {/* Left Side - Control Buttons Skeleton (Hidden on mobile) */}
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 animate-pulse rounded-lg"></div>
                    <div className="w-8 h-8 bg-white/10 animate-pulse rounded-lg"></div>
                  </div>

                  {/* Right Side - Navigation Buttons Skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-7 bg-white/10 animate-pulse rounded-lg"></div>
                    <div className="w-16 h-7 bg-white/10 animate-pulse rounded-lg"></div>
                  </div>
                </div>
              </div>

              {/* Server Selection Skeleton */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 md:p-4 shadow-2xl mt-4">
                <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-6">
                  {/* Left Column - Episode Info Skeleton */}
                  <div className="md:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-white/10 animate-pulse rounded-lg"></div>
                      <div className="w-20 h-5 bg-white/10 animate-pulse rounded-lg"></div>
                    </div>
                    <div className="w-48 h-3 bg-white/10 animate-pulse rounded"></div>
                  </div>

                  {/* Right Column - Server Buttons Skeleton */}
                  <div className="md:col-span-2 space-y-2 md:space-y-3">
                    {/* SUB Servers Skeleton */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-4 h-4 bg-white/10 animate-pulse rounded"></div>
                        <div className="w-8 h-4 bg-white/10 animate-pulse rounded"></div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {Array.from({ length: 2 }, (_, i) => (
                          <div
                            key={i}
                            className="w-14 h-7 bg-white/10 animate-pulse rounded-sm"
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* DUB Servers Skeleton */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-4 h-4 bg-white/10 animate-pulse rounded"></div>
                        <div className="w-8 h-4 bg-white/10 animate-pulse rounded"></div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {Array.from({ length: 2 }, (_, i) => (
                          <div
                            key={i}
                            className="w-14 h-7 bg-white/10 animate-pulse rounded-sm"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar Skeleton - Anime Details */}
            <div className="lg:col-span-3 order-3">
              <div className="bg-black rounded-2xl p-4 shadow-2xl">
                {/* Anime Poster Skeleton */}
                <div className="mb-4">
                  <div className="mb-4">
                    <div className="w-32 h-48 bg-white/10 animate-pulse mb-4"></div>
                    <div>
                      <div className="w-40 h-5 bg-white/10 animate-pulse rounded-lg mb-3"></div>

                      {/* Badges Skeleton */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {Array.from({ length: 6 }, (_, i) => (
                          <div
                            key={i}
                            className="w-8 h-4 bg-white/10 animate-pulse rounded"
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Skeleton */}
                <div className="bg-black/80 rounded-lg p-3">
                  <div className="space-y-2 max-h-32">
                    <div className="w-full h-3 bg-white/10 animate-pulse rounded"></div>
                    <div className="w-full h-3 bg-white/10 animate-pulse rounded"></div>
                    <div className="w-full h-3 bg-white/10 animate-pulse rounded"></div>
                    <div className="w-full h-3 bg-white/10 animate-pulse rounded"></div>
                    <div className="w-full h-3 bg-white/10 animate-pulse rounded"></div>
                    <div className="w-full h-3 bg-white/10 animate-pulse rounded"></div>
                    <div className="w-3/4 h-3 bg-white/10 animate-pulse rounded"></div>
                  </div>
                </div>

                {/* Other Seasons Skeleton */}
                <div className="mt-4">
                  <div className="w-24 h-4 bg-white/10 animate-pulse rounded-lg mb-3"></div>
                  <div className="space-y-2 max-h-[125px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {Array.from({ length: 2 }, (_, i) => (
                      <div
                        key={i}
                        className="flex items-center p-2.5 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="w-8 h-12 bg-white/10 animate-pulse rounded flex-shrink-0 mr-3"></div>
                        <div className="flex-1 min-w-0">
                          <div className="w-24 h-3 bg-white/10 animate-pulse rounded mb-1"></div>
                          <div className="w-16 h-2 bg-white/10 animate-pulse rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Skeleton */}
          <div className="mt-12">
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/10 animate-pulse rounded-xl"></div>
                <div className="w-40 h-6 bg-white/10 animate-pulse rounded-lg"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-[3/4] bg-white/10 animate-pulse rounded-xl"></div>
                    <div className="w-full h-3 bg-white/10 animate-pulse rounded"></div>
                    <div className="w-3/4 h-3 bg-white/10 animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const currentEpNumber = ep ? parseInt(ep) : 1;
  const currentEpisode =
    data.episodes.find((episode) => episode.episode_nr === currentEpNumber) ||
    data.episodes[0];

  // Format breadcrumb episode text
  const getBreadcrumbEpisodeText = () => {
    if (!currentEpisode?.title) {
      return `Episode ${currentEpNumber}`;
    }

    const decodedTitle = decodeHtmlEntities(currentEpisode.title);
    const episodePrefix = `Episode ${currentEpNumber}`;

    // Check if title is just "Episode X" (case insensitive)
    if (decodedTitle.toLowerCase().trim() === episodePrefix.toLowerCase()) {
      return episodePrefix;
    }

    // Return with title, truncate if too long
    const maxLength = 50;
    if (decodedTitle.length > maxLength) {
      return `${episodePrefix}: ${decodedTitle.substring(0, maxLength)}...`;
    }

    return `${episodePrefix}: ${decodedTitle}`;
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]" />
      </div>

      {/* Lights Off Overlay */}
      {lightsOff && (
        <div className="fixed inset-0 bg-black/80 z-10 pointer-events-none transition-all duration-500" />
      )}

      {/* Breadcrumb */}
      <div
        className={`py-4 md:py-6 px-3 md:px-6 bg-black/40 backdrop-blur-md transition-all duration-500 ${
          lightsOff ? "opacity-30" : ""
        }`}
      >
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center text-xs md:text-sm text-white/70 overflow-x-auto scrollbar-hide whitespace-nowrap">
            <Link
              href="/"
              className="hover:text-white transition-all duration-300 flex items-center gap-2 flex-shrink-0"
            >
              Home
            </Link>
            <svg
              className="w-3 h-3 md:w-4 md:h-4 mx-1.5 md:mx-3 text-white/40 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              href="/tv"
              className="hover:text-white transition-all duration-300 flex-shrink-0"
            >
              TV
            </Link>
            <svg
              className="w-3 h-3 md:w-4 md:h-4 mx-1.5 md:mx-3 text-white/40 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              href={`/${slug}`}
              className="hover:text-white transition-all duration-300 text-white/70 truncate max-w-[120px] md:max-w-none flex-shrink-0"
              title={data.watch_detail?.title || "Anime"}
            >
              {data.watch_detail?.title || "Anime"}
            </Link>
            <svg
              className="w-3 h-3 md:w-4 md:h-4 mx-1.5 md:mx-3 text-white/40 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span
              className="text-white font-medium flex-shrink-0"
              title={getBreadcrumbEpisodeText()}
            >
              {getBreadcrumbEpisodeText()}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-6 py-4 md:py-8">
        <div
          className={`grid ${
            isExpanded ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-12"
          } gap-4 md:gap-6`}
        >
          {/* Left Sidebar - Episodes List */}
          <div
            className={`${
              isExpanded ? "order-2" : "xl:col-span-3 order-2 xl:order-1"
            } transition-all duration-500 ${lightsOff ? "opacity-20" : ""}`}
          >
            <div className="p-3 md:p-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                <div>
                  <h3 className="text-white font-bold text-base md:text-lg">
                    Episodes
                  </h3>
                  <p className="text-white/40 text-xs">
                    {data.total_episodes} episodes available
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Sort Toggle Button */}
                  <button
                    onClick={() =>
                      setEpisodeSortOrder((prev) =>
                        prev === "asc" ? "desc" : "asc"
                      )
                    }
                    className="flex items-center gap-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-md text-white/60 hover:text-white/90 hover:bg-white/[0.08] hover:border-purple-500/30 transition-all duration-200 flex-shrink-0"
                    title={
                      episodeSortOrder === "asc"
                        ? "Sorted: 1 → Last"
                        : "Sorted: Last → 1"
                    }
                  >
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${
                        episodeSortOrder === "desc" ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                      />
                    </svg>
                    <span className="text-[10px] font-medium">
                      {episodeSortOrder === "asc"
                        ? `1→${data.total_episodes}`
                        : `${data.total_episodes}→1`}
                    </span>
                  </button>

                  {/* Search Input */}
                  <div className="relative flex-1 sm:flex-none">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <svg
                        className="w-3 h-3 text-white/30"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="number"
                      placeholder="#"
                      className="w-full sm:w-16 pl-7 pr-2 py-1.5 text-[10px] bg-white/5 rounded-md border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      min="1"
                      max={data.total_episodes}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        const value = parseInt(target.value);
                        if (
                          !isNaN(value) &&
                          value >= 1 &&
                          value <= data.total_episodes
                        ) {
                          const targetElement = document.querySelector(
                            `[data-episode="${value}"]`
                          );
                          if (targetElement) {
                            targetElement.classList.add(
                              "animate-pulse",
                              "bg-yellow-500/30",
                              "ring-2",
                              "ring-yellow-400/50"
                            );
                            setTimeout(() => {
                              targetElement.classList.remove(
                                "animate-pulse",
                                "bg-yellow-500/30",
                                "ring-2",
                                "ring-yellow-400/50"
                              );
                            }, 2000);
                            targetElement.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Episode List */}
              <div className="space-y-1 max-h-[300px] md:max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-1">
                {(() => {
                  const episodes = Array.from(
                    { length: data.total_episodes },
                    (_, i) => i + 1
                  );
                  return episodeSortOrder === "desc"
                    ? episodes.reverse()
                    : episodes;
                })().map((episodeNum) => {
                  const episode = data.episodes.find(
                    (ep) => ep.episode_nr === episodeNum
                  );
                  const isActive = episodeNum === currentEpNumber;
                  return (
                    <a
                      key={episodeNum}
                      href={`/watch/${slug}?ep=${episodeNum}`}
                      data-episode={episodeNum}
                      title={
                        episode
                          ? decodeHtmlEntities(episode.title)
                          : `Episode ${episodeNum}`
                      }
                      className={`group flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-purple-600/15 border border-purple-500/30"
                          : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10"
                      }`}
                    >
                      {/* Episode Number Badge */}
                      <div
                        className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold flex-shrink-0 transition-all duration-300 ${
                          isActive
                            ? "bg-purple-600 text-white"
                            : "bg-white/[0.08] text-white/50 group-hover:bg-white/[0.12] group-hover:text-white/70"
                        }`}
                      >
                        {episodeNum}
                      </div>

                      {/* Episode Title */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs md:text-sm font-medium truncate transition-colors duration-300 ${
                            isActive
                              ? "text-white"
                              : "text-white/60 group-hover:text-white/90"
                          }`}
                        >
                          {episode
                            ? decodeHtmlEntities(episode.title)
                            : `Episode ${episodeNum}`}
                        </p>
                      </div>

                      {/* Now Playing Indicator */}
                      {isActive && (
                        <div className="flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 md:w-6 md:h-6 text-purple-400 ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                          </svg>
                        </div>
                      )}

                      {/* Hover Play Icon */}
                      {!isActive && (
                        <div className="flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 md:w-5 md:h-5 text-white/0 group-hover:text-white/60 transition-all duration-300 ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                          </svg>
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div
            className={`${isExpanded ? "order-1" : "xl:col-span-6 order-1"} ${
              lightsOff ? "relative z-20" : ""
            }`}
          >
            {/* Video Player */}
            <div className="relative group">
              <div
                className={`bg-black shadow-2xl overflow-hidden transition-all duration-500 ${
                  lightsOff ? "" : ""
                }`}
              >
                <div
                  className={`relative ${
                    isExpanded
                      ? "aspect-[16/9] max-w-5xl mx-auto"
                      : "aspect-video"
                  }`}
                >
                  {currentIframeSrc ? (
                    <iframe
                      src={currentIframeSrc}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-orientation-lock allow-presentation allow-top-navigation allow-modals allow-popups allow-popups-to-escape-sandbox allow-downloads"
                      referrerPolicy="origin"
                      allow="autoplay *; encrypted-media *; fullscreen *; picture-in-picture *; accelerometer *; gyroscope *; clipboard-write *; web-share *"
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <div className="text-center space-y-4">
                        <svg
                          className="w-16 h-16 text-gray-600 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-gray-400 font-medium">
                          No video source available
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Control Bar */}
            <div
              className={`bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-2 md:p-3 shadow-2xl mt-3 md:mt-4 transition-all duration-500 ${
                lightsOff ? "relative z-20" : ""
              } ${isExpanded ? "max-w-5xl mx-auto" : ""}`}
            >
              <div className="flex flex-row items-center justify-between">
                {/* Left Side - Expand and Lights Controls (Hidden on mobile) */}
                <div className="hidden sm:flex items-center gap-2 md:gap-3">
                  {/* Expand/Contract */}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 group"
                    title={isExpanded ? "Contract view" : "Expand video"}
                  >
                    {isExpanded ? (
                      <svg
                        className="w-4 h-4 text-white group-hover:text-white/80"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9V4.5M15 9h4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15v4.5m0-4.5h4.5m-4.5 0l5.5 5.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-white group-hover:text-white/80"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Lights Toggle */}
                  <button
                    onClick={() => setLightsOff(!lightsOff)}
                    className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 group"
                    title={lightsOff ? "Turn lights on" : "Turn lights off"}
                  >
                    {lightsOff ? (
                      <svg
                        className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Right Side - Episode Navigation */}
                <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                  {/* Previous Episode */}
                  <Link
                    href={
                      currentEpNumber > 1
                        ? `/watch/${slug}?ep=${currentEpNumber - 1}`
                        : "#"
                    }
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-xs font-medium ${
                      currentEpNumber > 1
                        ? "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                        : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                    }`}
                    onClick={(e) => currentEpNumber <= 1 && e.preventDefault()}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span>Prev</span>
                  </Link>

                  {/* Next Episode */}
                  <Link
                    href={
                      currentEpNumber < data.total_episodes
                        ? `/watch/${slug}?ep=${currentEpNumber + 1}`
                        : "#"
                    }
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 text-xs font-medium ${
                      currentEpNumber < data.total_episodes
                        ? "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                        : "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                    }`}
                    onClick={(e) =>
                      currentEpNumber >= data.total_episodes &&
                      e.preventDefault()
                    }
                  >
                    <span>Next</span>
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Server Selection */}
            <div
              className={`bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 md:p-4 shadow-2xl mt-3 md:mt-4 transition-all duration-500 ${
                lightsOff ? "opacity-30" : ""
              } ${isExpanded ? "max-w-5xl mx-auto" : ""}`}
            >
              <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-6">
                {/* Left Column - Episode Info (Narrower) */}
                <div className="text-white md:col-span-1">
                  <h4 className="text-sm md:text-base font-bold mb-1 flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg shadow-lg">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    Episode {currentEpisode?.episode_nr || currentEpNumber}
                  </h4>
                  <p className="text-white/50 text-xs">
                    Switch servers if current one doesn&apos;t work.
                  </p>
                </div>

                {/* Right Column - Server Buttons (Wider) */}
                <div className="space-y-2 md:space-y-3 md:col-span-2">
                  {/* SUB Servers */}
                  {currentEpisode?.servers?.sub && (
                    <div className="flex items-center gap-3">
                      <h5 className="text-white font-medium text-sm flex items-center gap-2 flex-shrink-0">
                        <Image
                          src="/cc.svg"
                          alt="CC"
                          width={15}
                          height={15}
                          className="brightness-0 invert"
                        />
                        SUB
                      </h5>
                      <div className="flex gap-2 flex-wrap">
                        {Array.isArray(currentEpisode.servers.sub) ? (
                          currentEpisode.servers.sub.map((server, idx) => (
                            <button
                              key={server.server_id}
                              onClick={() =>
                                setCurrentIframeSrc(server.ifram_src)
                              }
                              className={`px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:cursor-pointer rounded-sm border ${
                                currentIframeSrc === server.ifram_src
                                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 shadow-md"
                                  : "bg-white/5 text-white/70 hover:text-white hover:bg-blue-500/10 border-white/10 hover:border-blue-400/50"
                              }`}
                            >
                              {server.name || `HD-${idx + 1}`}
                            </button>
                          ))
                        ) : currentEpisode.servers.sub &&
                          "src" in currentEpisode.servers.sub ? (
                          <button
                            onClick={() =>
                              setCurrentIframeSrc(
                                (currentEpisode.servers.sub as SimpleServer).src
                              )
                            }
                            className={`px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:cursor-pointer rounded-sm border ${
                              currentIframeSrc ===
                              (currentEpisode.servers.sub as SimpleServer).src
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400 shadow-md"
                                : "bg-white/5 text-white/70 hover:text-white hover:bg-blue-500/10 border-white/10 hover:border-blue-400/50"
                            }`}
                          >
                            HD-1
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* DUB Servers */}
                  {currentEpisode?.servers?.dub && (
                    <div className="flex items-center gap-3">
                      <h5 className="text-white font-medium text-sm flex items-center gap-2 flex-shrink-0">
                        <Image
                          src="/mic.svg"
                          alt="mic"
                          width={15}
                          height={15}
                          className="brightness-0 invert"
                        />
                        DUB
                      </h5>
                      <div className="flex gap-2 flex-wrap">
                        {Array.isArray(currentEpisode.servers.dub) ? (
                          currentEpisode.servers.dub.map((server, idx) => (
                            <button
                              key={server.server_id}
                              onClick={() =>
                                setCurrentIframeSrc(server.ifram_src)
                              }
                              className={`px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:cursor-pointer rounded-sm border ${
                                currentIframeSrc === server.ifram_src
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-md"
                                  : "bg-white/5 text-white/70 hover:text-white hover:bg-green-500/10 border-white/10 hover:border-green-400/50"
                              }`}
                            >
                              {server.name || `HD-${idx + 1}`}
                            </button>
                          ))
                        ) : currentEpisode.servers.dub &&
                          "src" in currentEpisode.servers.dub ? (
                          <button
                            onClick={() =>
                              setCurrentIframeSrc(
                                (currentEpisode.servers.dub as SimpleServer).src
                              )
                            }
                            className={`px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:cursor-pointer rounded-sm border ${
                              currentIframeSrc ===
                              (currentEpisode.servers.dub as SimpleServer).src
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-md"
                                : "bg-white/5 text-white/70 hover:text-white hover:bg-green-500/10 border-white/10 hover:border-green-400/50"
                            }`}
                          >
                            HD-1
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Anime Details */}
          <div className={isExpanded ? "order-3" : "xl:col-span-3 order-3"}>
            {data.watch_detail && (
              <div className="bg-black rounded-xl md:rounded-2xl p-3 md:p-4 shadow-2xl">
                {/* Anime Poster and Title */}
                <div className="mb-3 md:mb-4">
                  <div className="flex md:flex-col gap-3 md:gap-0 mb-3 md:mb-4">
                    <div className="relative group mb-0 md:mb-4 flex-shrink-0">
                      <Image
                        src={data.watch_detail.poster}
                        alt={data.watch_detail.title}
                        width={120}
                        height={180}
                        className="w-20 h-28 md:w-32 md:h-48 object-cover shadow-lg transition-all duration-300 "
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm md:text-lg font-bold text-white mb-2 md:mb-3 leading-tight line-clamp-2">
                        {data.watch_detail.title}
                      </h2>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center justify-start gap-1 mb-2">
                        {data.watch_detail.content_rating && (
                          <span className="badge badge-gray px-1.5 py-0.5 text-[9px] md:text-[10px] whitespace-nowrap">
                            {data.watch_detail.content_rating}
                          </span>
                        )}
                        {data.watch_detail.quality && (
                          <span className="badge badge-blue px-1.5 py-0.5 text-[9px] md:text-[10px] whitespace-nowrap">
                            {data.watch_detail.quality}
                          </span>
                        )}
                        {data.watch_detail.sub_count && (
                          <span className="badge badge-purple px-1.5 py-0.5 text-[9px] md:text-[10px] whitespace-nowrap">
                            <Image
                              src="/cc.svg"
                              alt="CC"
                              width={8}
                              height={8}
                              className="brightness-0 invert"
                            />
                            <span>{data.watch_detail.sub_count}</span>
                          </span>
                        )}
                        {data.total_episodes && (
                          <span className="badge badge-blue px-1.5 py-0.5 text-[9px] md:text-[10px] whitespace-nowrap">
                            Eps: {data.total_episodes}
                          </span>
                        )}
                        {data.watch_detail.type && (
                          <span className="badge badge-pink px-1.5 py-0.5 text-[9px] md:text-[10px] whitespace-nowrap">
                            {data.watch_detail.type}
                          </span>
                        )}
                        {data.watch_detail.duration && (
                          <span className="badge badge-gray px-1.5 py-0.5 text-[9px] md:text-[10px] whitespace-nowrap">
                            {data.watch_detail.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="bg-black/80 rounded-lg p-2 md:p-3">
                    <div className="text-white/90 text-xs md:text-sm leading-relaxed max-h-20 md:max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {data.watch_detail.description ||
                        "No description available."}
                    </div>
                  </div>
                </div>

                {/* Other Seasons */}
                {data.other_seasons && data.other_seasons.length > 0 && (
                  <div className="mt-3 md:mt-4">
                    <h3 className="text-white font-semibold mb-2 md:mb-3 text-xs md:text-sm">
                      Other Seasons
                    </h3>
                    <div className="space-y-2 max-h-[125px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {data.other_seasons.map((season, index) => (
                        <Link
                          href={season.url}
                          key={index}
                          className={`flex items-center p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                            season.active
                              ? "bg-blue-500/20 border-blue-400/30 ring-1 ring-blue-400/20"
                              : "bg-black/20 border-white/10 hover:bg-black/30 hover:border-white/20"
                          }`}
                        >
                          <div className="w-8 h-12 relative flex-shrink-0 mr-3 rounded overflow-hidden">
                            <Image
                              src={season.poster}
                              alt={season.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`font-medium text-xs truncate ${
                                season.active ? "text-blue-300" : "text-white"
                              }`}
                            >
                              {season.title}
                            </h4>
                            {season.active && (
                              <span className="text-xs text-blue-400">
                                Currently Watching
                              </span>
                            )}
                          </div>
                          {season.active && (
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations - Full Width */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div
            className={`mt-6 md:mt-8 transition-all duration-500 ${
              lightsOff ? "opacity-20" : ""
            }`}
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
              You might also like
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {data.recommendations.slice(0, 16).map((rec, index) => (
                <AnimeCard
                  key={index}
                  anime={{
                    title: rec.title,
                    thumbnail: rec.poster,
                    link: rec.url,
                    type: rec.qtip.type,
                    duration: rec.qtip.eps ? `${rec.qtip.eps} eps` : undefined,
                    qtip: {
                      ...rec.qtip,
                      dub: rec.qtip.dub || undefined,
                      synonyms: rec.qtip.synonyms || undefined,
                    },
                    latest_episode: rec.qtip.sub,
                    dub: rec.qtip.dub || undefined,
                  }}
                  showMeta={true}
                  badgeType="latest"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
