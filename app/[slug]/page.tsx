import { Metadata } from "next";
import { AnimeInfoPage } from "@/components/AnimeInfoPage";
import { api } from "@/services/api";
import type { AnimeDetailsInfo } from "@/types";
import { mapAnimeDetails } from "@/utils/mappers";

type Props = {
  params: Promise<{ slug: string }>;
};

function slugToTitle(raw: string): string {
  // Remove leading slash if any and decode
  const cleaned = decodeURIComponent(raw.replace(/^\/+/, ""));
  // Split by hyphen
  const parts = cleaned.split("-").filter(Boolean);
  // If last part is a pure number (id), drop it
  if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
    parts.pop();
  }
  const words = parts.map((w) => w.replace(/[^a-zA-Z0-9]/g, " "));
  const joined = words.join(" ").replace(/\s+/g, " ").trim();
  // Title case every word (simple approach)
  const titleCased = joined
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return titleCased;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const title = slugToTitle(resolvedParams.slug);
  return {
    title: title,
    description: `Watch ${title} online on Yumekai`,
  };
}

// mapAnimeDetails now lives in models/mappers.ts

async function fetchAnimeInfo(slug: string) {
  try {
    const apiData = await api.details(slug);
    return mapAnimeDetails(apiData as AnimeDetailsInfo);
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return null;
  }
}

async function fetchTopAnimeData() {
  try {
    const [topAiringRaw, mostPopularRaw, mostFavoriteRaw, completedRaw] =
      await Promise.all([
        api
          .topAiring()
          .then((r) => r.results)
          .catch(() => []),
        api
          .mostPopular()
          .then((r) => r.results)
          .catch(() => []),
        api
          .mostFavorite()
          .then((r) => r.results)
          .catch(() => []),
        api
          .completed()
          .then((r) => r.results)
          .catch(() => []),
      ]);
    return {
      topAiring: topAiringRaw,
      mostPopular: mostPopularRaw,
      mostFavorite: mostFavoriteRaw,
      completed: completedRaw,
    };
  } catch (error) {
    console.error("Error fetching top anime data:", error);
    return {
      topAiring: [],
      mostPopular: [],
      mostFavorite: [],
      completed: [],
    };
  }
}

export default async function AnimeDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const [animeInfo, topAnimeData] = await Promise.all([
    fetchAnimeInfo(resolvedParams.slug),
    fetchTopAnimeData(),
  ]);

  if (!animeInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Anime Not Found
          </h1>
          <p className="text-white/60">
            The anime you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return <AnimeInfoPage animeInfo={animeInfo} topAnimeData={topAnimeData} />;
}
