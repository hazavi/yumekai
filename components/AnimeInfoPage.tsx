"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { TopAnime } from "./TopAnime";
import { AnimeCard } from "./AnimeCard";
import { AddToListButton } from "./AddToListButton";
import type { QtipData, BasicAnime } from "@/types";

interface AnimeInfo {
  title: string;
  thumbnail: string;
  description: string;
  genres: string[];
  info: {
    Japanese?: string;
    Synonyms?: string;
    Aired?: string;
    Duration?: string;
    Premiered?: string;
    Status?: string;
    "MAL Score"?: string;
    Studios?: string[];
    Producers?: string[];
    Genres?: string[];
  };
  quality?: string;
  sub_count?: string;
  dub_count?: string;
  watch_link?: string;
  link?: string;
  type?: string;
  recommendations?: Array<{
    title: string;
    poster: string; // fully qualified or relative image URL
    url: string; // full or relative link
    qtip?: QtipData;
  }>;
}

interface AnimeInfoPageProps {
  animeInfo: AnimeInfo | null;
  topAnimeData?: {
    topAiring: BasicAnime[];
    mostPopular: BasicAnime[];
    mostFavorite: BasicAnime[];
    completed: BasicAnime[];
  };
}

export function AnimeInfoPage({ animeInfo, topAnimeData }: AnimeInfoPageProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Skeleton loading state
  if (!animeInfo) {
    return (
      <div className="relative min-h-screen pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-4 w-12 bg-white/10 rounded" />
            <div className="h-4 w-4 bg-white/5 rounded" />
            <div className="h-4 w-8 bg-white/10 rounded" />
            <div className="h-4 w-4 bg-white/5 rounded" />
            <div className="h-4 w-32 bg-white/10 rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-8">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Poster skeleton */}
                <div className="flex-shrink-0">
                  <div className="w-60 h-85 bg-white/10 rounded" />
                  <div className="w-60 h-10 mt-3 bg-white/10 rounded-full" />
                </div>

                {/* Info skeleton */}
                <div className="flex-1 space-y-4">
                  <div className="h-10 w-3/4 bg-white/10 rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 w-12 bg-white/10 rounded-full" />
                    <div className="h-6 w-14 bg-white/10 rounded-full" />
                    <div className="h-6 w-14 bg-white/10 rounded-full" />
                    <div className="h-6 w-10 bg-white/10 rounded-full" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-11 w-32 bg-white/10 rounded-full" />
                    <div className="h-11 w-32 bg-white/10 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="lg:col-span-4">
              <div className="glass p-6 space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="h-4 w-20 bg-white/10 rounded" />
                    <div className="h-4 flex-1 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations Skeleton */}
          <div className="mt-12">
            <div className="h-8 w-48 bg-white/10 rounded mb-6" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[2/3] bg-white/10 rounded" />
                  <div className="h-4 w-full bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine the anime type for breadcrumbs
  const getAnimeType = () => {
    if (animeInfo.type) return animeInfo.type;
    // Fallback to checking if it's in info object
    return "TV"; // Default fallback
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: getAnimeType(), href: `/${getAnimeType().toLowerCase()}` },
    { label: animeInfo.title, href: "#" },
  ];

  return (
    <div className="relative min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-white/60 mb-8">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2">
                  <svg
                    className="w-4 h-4 mx-3 text-white/40"
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
                </span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-white">{breadcrumb.label}</span>
              ) : (
                <a
                  href={breadcrumb.href}
                  className="hover:text-white transition-colors"
                >
                  {breadcrumb.label}
                </a>
              )}
            </div>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Anime Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="relative w-60 h-85 overflow-hidden bg-gray-800">
                  {animeInfo.thumbnail ? (
                    <Image
                      src={animeInfo.thumbnail}
                      alt={animeInfo.title || "Anime poster"}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40">
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Watch2gether Button */}
                <Link
                  href={`/watch2gether?anime=${encodeURIComponent(
                    animeInfo.link ||
                      animeInfo.watch_link?.replace("/watch/", "") ||
                      ""
                  )}&title=${encodeURIComponent(
                    animeInfo.title
                  )}&poster=${encodeURIComponent(animeInfo.thumbnail)}`}
                  className="btn-gray text-sm font-medium w-60 inline-flex items-center justify-center gap-2 px-4 py-2.5 transition-all"
                >
                  <Image
                    src="/stream.svg"
                    alt="Watch Together"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                  Watch2gether
                </Link>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-4">
                  {animeInfo.title}
                </h1>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {animeInfo.quality && (
                    <span className="badge badge-blue px-3 py-1 text-xs">
                      {animeInfo.quality}
                    </span>
                  )}
                  {animeInfo.sub_count && animeInfo.sub_count !== "0" && (
                    <span className="badge badge-purple px-3 py-1 text-xs">
                      <Image
                        src="/cc.svg"
                        alt="CC"
                        width={12}
                        height={12}
                        className="w-3 h-3 brightness-0 invert"
                      />
                      {animeInfo.sub_count}
                    </span>
                  )}
                  {animeInfo.dub_count && animeInfo.dub_count !== "0" && (
                    <span className="badge badge-emerald px-3 py-1 text-xs">
                      <Image
                        src="/mic.svg"
                        alt="MIC"
                        width={12}
                        height={12}
                        className="w-3 h-3 brightness-0 invert"
                      />
                      {animeInfo.dub_count}
                    </span>
                  )}
                  <span className="badge badge-pink px-3 py-1 text-xs">
                    {getAnimeType()}
                  </span>
                  <span className="badge badge-gray px-3 py-1 text-xs">
                    {animeInfo.info?.Duration || "24m"}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {/* Hide Watch Now button for upcoming anime */}
                  {animeInfo.info?.Status?.toLowerCase() !==
                    "not yet aired" && (
                    <a
                      href={animeInfo.watch_link || "#"}
                      className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 transition shadow"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8 5v10l8-5z" />
                      </svg>
                      Watch Now
                    </a>
                  )}
                  <AddToListButton
                    anime={{
                      animeId:
                        animeInfo.link ||
                        animeInfo.watch_link?.replace("/watch/", "") ||
                        "",
                      title: animeInfo.title,
                      poster: animeInfo.thumbnail,
                    }}
                    variant="large"
                  />
                </div>

                {/* Description */}
                <div className="text-white/80 leading-relaxed text-sm">
                  <p className={showFullDescription ? "" : "line-clamp-3"}>
                    {animeInfo.description || "No description available."}
                  </p>
                  {animeInfo.description &&
                    animeInfo.description.length > 200 && (
                      <button
                        onClick={() =>
                          setShowFullDescription(!showFullDescription)
                        }
                        className="text-purple-500 hover:cursor-pointer hover:text-purple-400 mt-2 text-sm font-medium"
                      >
                        {showFullDescription ? "- Less" : "+ More"}
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="glass p-6">
              <div className="space-y-3">
                {animeInfo.info?.Japanese && (
                  <div className="text-sm">
                    <span className="text-white/60">Japanese: </span>
                    <span className="text-white">
                      {animeInfo.info.Japanese}
                    </span>
                  </div>
                )}
                {animeInfo.info?.Synonyms && (
                  <div className="text-sm">
                    <span className="text-white/60">Synonyms: </span>
                    <span className="text-white">
                      {animeInfo.info.Synonyms}
                    </span>
                  </div>
                )}
                {animeInfo.info?.Aired && (
                  <div className="text-sm">
                    <span className="text-white/60">Aired: </span>
                    <span className="text-white">{animeInfo.info.Aired}</span>
                  </div>
                )}

                {animeInfo.info?.Premiered && (
                  <div className="text-sm">
                    <span className="text-white/60">Premiered: </span>
                    <span className="text-white">
                      {animeInfo.info.Premiered}
                    </span>
                  </div>
                )}

                {animeInfo.info?.Duration && (
                  <div className="text-sm">
                    <span className="text-white/60">Duration: </span>
                    <span className="text-white">
                      {animeInfo.info.Duration}
                    </span>
                  </div>
                )}

                {animeInfo.info?.Status && (
                  <div className="text-sm">
                    <span className="text-white/60">Status: </span>
                    <span className="text-white">{animeInfo.info.Status}</span>
                  </div>
                )}

                {animeInfo.info?.["MAL Score"] && (
                  <div className="text-sm">
                    <span className="text-white/60">MAL Score: </span>
                    <span className="text-white">
                      {animeInfo.info["MAL Score"]}
                    </span>
                  </div>
                )}

                {animeInfo.genres && animeInfo.genres.length > 0 && (
                  <div className="text-sm">
                    <span className="text-white/60">Genres: </span>
                    <div className="inline-flex flex-wrap gap-1.5 mt-1">
                      {animeInfo.genres.map((genre, index) => (
                        <a
                          key={index}
                          href={`/genre/${genre
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="genre-item px-3 py-1 text-xs text-white/80 rounded-full cursor-pointer"
                        >
                          {genre}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {animeInfo.info?.Studios &&
                  animeInfo.info.Studios.length > 0 && (
                    <div className="text-sm">
                      <span className="text-white/60">Studios: </span>
                      <span className="text-white">
                        {animeInfo.info.Studios.join(", ")}
                      </span>
                    </div>
                  )}

                {animeInfo.info?.Producers &&
                  animeInfo.info.Producers.length > 0 && (
                    <div className="text-sm">
                      <span className="text-white/60">Producers: </span>
                      <span className="text-white">
                        {animeInfo.info.Producers.join(", ")}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {animeInfo.recommendations && animeInfo.recommendations.length > 0 && (
          <div className="mt-12 grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                You might also like
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
                {animeInfo.recommendations
                  .slice(0, 12)
                  .filter((rec) => rec.poster && rec.poster.trim() !== "")
                  .map((rec, index) => {
                    const poster =
                      rec.poster && rec.poster.trim() !== ""
                        ? rec.poster
                        : "/yumelogo.png";
                    const href =
                      rec.url && rec.url.trim() !== "" ? rec.url : "#";

                    // Transform recommendation to AnimeCard format
                    const animeCardData = {
                      link: href,
                      thumbnail: poster,
                      title: rec.title || "Untitled",
                      type: rec.qtip?.type || "TV",
                      qtip: rec.qtip,
                      latest_episode: rec.qtip?.eps || undefined,
                      dub: rec.qtip?.dub || undefined,
                      duration: "24m", // Default duration
                    };

                    return (
                      <AnimeCard
                        key={index}
                        anime={animeCardData}
                        showMeta={true}
                        badgeType="latest"
                      />
                    );
                  })}
              </div>
            </div>

            {/* TopAnime Sidebar */}
            <div className="xl:col-span-4">
              {topAnimeData && (
                <TopAnime
                  data={{
                    top_today: topAnimeData.topAiring
                      .slice(0, 10)
                      .map((anime, index) => ({
                        ...anime,
                        rank: (index + 1).toString(),
                      })),
                    top_week: topAnimeData.mostPopular
                      .slice(0, 10)
                      .map((anime, index) => ({
                        ...anime,
                        rank: (index + 1).toString(),
                      })),
                    top_month: topAnimeData.mostFavorite
                      .slice(0, 10)
                      .map((anime, index) => ({
                        ...anime,
                        rank: (index + 1).toString(),
                      })),
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
