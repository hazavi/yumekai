"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import {
  getUserByUsername,
  getUserAnimeListGrouped,
  getUserTopRankings,
  getUserListCounts,
  UserAnimeList,
  TopRankAnime,
  AnimeListStatus,
  AnimeListItem,
  LIST_STATUS_LABELS,
  LIST_STATUS_COLORS,
} from "@/services/animeListService";

// Sort options type
type SortOption = "newest" | "oldest";

// SVG Icons
const Icons = {
  calendar: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  film: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
      />
    </svg>
  ),
  settings: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  trophy: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
      />
    </svg>
  ),
  collection: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  ),
  arrowLeft: (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  ),
  play: (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  check: (
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
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  pause: (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  ),
  x: (
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  clock: (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  sort: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
      />
    </svg>
  ),
};

const STATUS_ICONS: Record<AnimeListStatus, React.ReactNode> = {
  watching: Icons.play,
  completed: Icons.check,
  "on-hold": Icons.pause,
  dropped: Icons.x,
  "plan-to-watch": Icons.clock,
};

// Ordered list of statuses (as requested: watching, plan to watch, on hold, completed, dropped)
const ORDERED_STATUSES: AnimeListStatus[] = [
  "watching",
  "plan-to-watch",
  "on-hold",
  "completed",
  "dropped",
];

interface UserProfilePageProps {
  username: string;
}

export function UserProfilePage({ username }: UserProfilePageProps) {
  const { user, userProfile } = useAuth();
  const [profileUser, setProfileUser] = useState<{
    uid: string;
    username: string;
    displayName: string | null;
    photoURL: string | null;
    bio: string | null;
    createdAt: number;
    lastUsernameChange?: number;
  } | null>(null);
  const [animeLists, setAnimeLists] = useState<UserAnimeList | null>(null);
  const [topRankings, setTopRankings] = useState<(TopRankAnime | null)[]>([]);
  const [listCounts, setListCounts] = useState<Record<
    AnimeListStatus | "total",
    number
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AnimeListStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userProfileSortOption");
      if (saved === "newest" || saved === "oldest") {
        return saved;
      }
    }
    return "newest";
  });

  const isOwnProfile =
    user && userProfile?.username?.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userData = await getUserByUsername(username);
        if (userData) {
          setProfileUser(userData);
          const [lists, rankings, counts] = await Promise.all([
            getUserAnimeListGrouped(userData.uid),
            getUserTopRankings(userData.uid),
            getUserListCounts(userData.uid),
          ]);
          setAnimeLists(lists);
          setTopRankings(rankings);
          setListCounts(counts);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  // Memoized filtered and sorted anime list - must be before any early returns
  const filteredAnime = useMemo(() => {
    if (!animeLists) return [];

    let animeList: AnimeListItem[];
    if (activeTab === "all") {
      animeList = Object.values(animeLists).flat();
    } else {
      animeList = animeLists[activeTab] || [];
    }

    // Sort by addedAt (when user added it to their list)
    return [...animeList].sort((a, b) => {
      if (sortOption === "newest") {
        return b.addedAt - a.addedAt;
      } else {
        return a.addedAt - b.addedAt;
      }
    });
  }, [animeLists, activeTab, sortOption]);

  // Memoized pagination calculations
  const ITEMS_PER_PAGE = 24;
  const totalPages = useMemo(
    () => Math.ceil(filteredAnime.length / ITEMS_PER_PAGE),
    [filteredAnime.length]
  );

  const paginatedAnime = useMemo(
    () =>
      filteredAnime.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredAnime, currentPage]
  );

  // Memoized tab change handler
  const handleTabChange = useCallback((tab: AnimeListStatus | "all") => {
    setActiveTab(tab);
    setCurrentPage(1);
  }, []);

  // Memoized sort change handler
  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortOption(newSort);
    setCurrentPage(1);
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("userProfileSortOption", newSort);
    }
  }, []);

  // Display name - computed after hooks but before conditional returns
  const displayName = profileUser?.displayName || profileUser?.username || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-black to-blue-900/10" />
        </div>
        <div className="container-padded py-12">
          <div className="space-y-6">
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white/10" />
                <div className="space-y-3 flex-1">
                  <div className="h-7 w-48 bg-white/10 rounded-lg" />
                  <div className="h-4 w-32 bg-white/10 rounded" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 glass rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-black to-blue-900/10" />
        </div>
        <div className="container-padded py-12 text-center">
          <div className="glass rounded-2xl p-12 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-white/30">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">
              User Not Found
            </h1>
            <p className="text-white/50 text-sm mb-6">
              The user &quot;{username}&quot; doesn&apos;t exist or has a
              private profile.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-xl text-white hover:bg-white/10 transition-all text-sm"
            >
              {Icons.arrowLeft}
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/15 via-black to-blue-900/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.12),transparent_50%)]" />
      </div>

      <div className="container-padded">
        {/* Profile Header */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            {profileUser.photoURL ? (
              <Image
                src={profileUser.photoURL}
                alt={displayName}
                width={100}
                height={100}
                className="rounded-full ring-2 ring-white/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/40 to-blue-500/40 flex items-center justify-center text-white font-semibold text-3xl ring-2 ring-white/10">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-semibold text-white mb-1">
                {displayName}
              </h1>
              <p className="text-white/40 text-sm mb-3">
                @{profileUser.username}
              </p>
              {profileUser.bio && (
                <p className="text-white/60 text-sm mb-4 max-w-2xl leading-relaxed">
                  {profileUser.bio}
                </p>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1.5">
                  {Icons.calendar}
                  Joined{" "}
                  {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  {Icons.film}
                  {listCounts?.total || 0} anime
                </span>
              </div>
            </div>

            {/* Settings Button */}
            {isOwnProfile && (
              <Link
                href={`/user/${userProfile?.username}/settings`}
                className="flex items-center gap-2 px-4 py-2 glass-soft rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
              >
                {Icons.settings}
                <span className="hidden sm:inline">Settings</span>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Tabs - Horizontal Scrollable on Mobile, Flex Wrap on Desktop */}
        <div className="mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide snap-x snap-mandatory md:snap-none touch-pan-x md:flex-wrap">
            <button
              onClick={() => handleTabChange("all")}
              className={`flex-shrink-0 md:flex-shrink snap-start md:snap-align-none px-4 py-2 rounded-full transition-all cursor-pointer text-center whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-xs md:text-sm font-medium">Total</span>
              <span className="ml-1.5 text-xs md:text-sm opacity-70">
                {listCounts?.total || 0}
              </span>
            </button>
            {ORDERED_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleTabChange(status)}
                className={`flex-shrink-0 md:flex-shrink snap-start md:snap-align-none px-4 py-2 rounded-full transition-all cursor-pointer text-center whitespace-nowrap ${
                  activeTab === status
                    ? `${LIST_STATUS_COLORS[status]} text-white`
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="text-xs md:text-sm font-medium">
                  {LIST_STATUS_LABELS[status]}
                </span>
                <span className="ml-1.5 text-xs md:text-sm opacity-70">
                  {listCounts?.[status] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Anime Lists */}
        <div className="glass rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg font-medium text-white">
              {activeTab === "all"
                ? "All Anime"
                : LIST_STATUS_LABELS[activeTab]}
            </h2>
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-white/40 hidden sm:inline">
                  {Icons.sort}
                </span>
                <select
                  value={sortOption}
                  onChange={(e) =>
                    handleSortChange(e.target.value as SortOption)
                  }
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none pr-6 bg-no-repeat bg-[length:12px] bg-[center_right_6px]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ffffff60'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  }}
                >
                  <option value="newest" className="bg-zinc-900">
                    Newest First
                  </option>
                  <option value="oldest" className="bg-zinc-900">
                    Oldest First
                  </option>
                </select>
              </div>
              {filteredAnime.length > 0 && (
                <span className="text-xs text-white/40">
                  {filteredAnime.length} anime
                </span>
              )}
            </div>
          </div>

          {paginatedAnime.length === 0 ? (
            <div className="text-center py-12 sm:py-16 text-white/30">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                {Icons.collection}
              </div>
              <p className="text-sm">No anime in this list</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                {paginatedAnime.map((anime) => (
                  <Link
                    key={anime.animeId}
                    href={anime.animeId}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5">
                      <Image
                        src={anime.thumbnail}
                        alt={anime.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div
                        className={`absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm ${
                          anime.status === "watching"
                            ? "text-blue-400"
                            : anime.status === "completed"
                            ? "text-green-400"
                            : anime.status === "on-hold"
                            ? "text-yellow-400"
                            : anime.status === "dropped"
                            ? "text-red-400"
                            : "text-purple-400"
                        }`}
                      >
                        {STATUS_ICONS[anime.status as AnimeListStatus]}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-[11px] font-medium line-clamp-2">
                          {anime.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm cursor-pointer"
                  >
                    Prev
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first, last, current, and pages around current
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((page, idx, arr) => {
                        // Add ellipsis if there's a gap
                        const showEllipsisBefore =
                          idx > 0 && page - arr[idx - 1] > 1;
                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsisBefore && (
                              <span className="px-2 text-white/30 text-sm">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-8 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                currentPage === page
                                  ? "bg-purple-600 text-white"
                                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-6 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Top 10 Rankings */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <span className="text-white/60">{Icons.trophy}</span>
              Top 10 Rankings
            </h2>
            {isOwnProfile && (
              <Link
                href={`/user/${username}/rankings/edit`}
                className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                Edit
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 gap-3 sm:gap-2 lg:grid-cols-10">
            {topRankings.map((anime, index) => (
              <div key={index} className="relative group">
                {anime && anime.thumbnail ? (
                  <Link href={anime.animeId} className="block">
                    <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-white/5">
                      <Image
                        src={anime.thumbnail}
                        alt={anime.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-1 left-1 w-5 h-5 bg-black/60 backdrop-blur-sm rounded-sm flex items-center justify-center text-white font-semibold text-[10px]">
                        {index + 1}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-1.5">
                        <p className="text-white text-[11px] font-medium line-clamp-2">
                          {anime.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="aspect-[3/4] rounded-md bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center text-white/20">
                    <div className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-white/30 font-medium text-[10px] mb-0.5">
                      {index + 1}
                    </div>
                    <span className="text-[8px]">Empty</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
