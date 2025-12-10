"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeToContinueWatching,
  removeContinueWatching,
  ContinueWatchingItem,
} from "@/services/continueWatchingService";

export function ContinueWatching() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: ContinueWatchingItem | null;
  }>({ isOpen: false, item: null });
  const [deleting, setDeleting] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToContinueWatching(user.uid, (data) => {
      setItems(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleDelete = async () => {
    if (!user || !deleteModal.item) return;

    setDeleting(true);
    try {
      await removeContinueWatching(user.uid, deleteModal.item.animeId);
      setDeleteModal({ isOpen: false, item: null });
    } catch (error) {
      console.error("Error removing from continue watching:", error);
    } finally {
      setDeleting(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Don't render if not logged in or no items
  if (!user || loading) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <section className="container-padded mt-8 mb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl md:text-2xl font-semibold text-white flex items-center gap-3">
            Continue Watching
          </h2>
          <span className="text-sm text-white/40">{items.length} anime</span>
        </div>

        <div className="relative group/scroll">
          {/* Left scroll button - hidden on mobile/tablet */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 items-center justify-center text-white/80 hover:text-white hover:bg-purple-600/80 transition-all cursor-pointer hidden lg:flex -translate-x-1/2 opacity-0 group-hover/scroll:opacity-100"
            >
              <svg
                className="w-5 h-5"
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
            </button>
          )}

          {/* Right scroll button - hidden on mobile/tablet */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 backdrop-blur-sm border border-white/10 items-center justify-center text-white/80 hover:text-white hover:bg-purple-600/80 transition-all cursor-pointer hidden lg:flex translate-x-1/2 opacity-0 group-hover/scroll:opacity-100"
            >
              <svg
                className="w-5 h-5"
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
            </button>
          )}

          {/* Horizontal scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
          >
            {items.slice(0, 10).map((item) => (
              <div
                key={item.animeId}
                className="relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] snap-start group"
              >
                {/* Card */}
                <Link
                  href={`/watch/${item.animeId}?ep=${item.currentEpisode}`}
                  className="block"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                    <Image
                      src={item.poster}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${
                            (item.currentEpisode / item.totalEpisodes) * 100
                          }%`,
                        }}
                      />
                    </div>

                    {/* Episode info - shown on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-3">
                      <div className="text-center">
                        <div className="text-white font-semibold text-sm mb-1">
                          Episode {item.currentEpisode} / {item.totalEpisodes}
                        </div>
                        <div className="text-white/40 text-xs">
                          {formatTimeAgo(item.watchedAt)}
                        </div>
                      </div>
                      {/* Play button */}
                      <div className="mt-3 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-medium line-clamp-2 mb-1">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                          EP {item.currentEpisode}
                        </span>
                        <span className="text-[10px] text-white/50">
                          {formatTimeAgo(item.watchedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteModal({ isOpen: true, item });
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                >
                  <svg
                    className="w-4 h-4"
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
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 w-full max-w-md animate-fadeIn">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Remove from Continue Watching?
                </h3>
                <p className="text-sm text-white/50">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-6">
              <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={deleteModal.item.poster}
                  alt={deleteModal.item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {deleteModal.item.title}
                </p>
                <p className="text-xs text-white/50">
                  Episode {deleteModal.item.currentEpisode} /{" "}
                  {deleteModal.item.totalEpisodes}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, item: null })}
                disabled={deleting}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
