import { Metadata } from "next";
import { AnimeListTemplate } from "@/components";
import { mapAnimeListResults } from "@/utils/mappers";
import { api } from "@/services/api";

export const metadata: Metadata = {
  title: "Recently Added",
  description: "Browse recently added anime on Yumekai",
};

async function getRecentlyAddedData(page: number = 1) {
  try {
    const results = await Promise.allSettled([
      api.recentlyAdded(page),
      api.topAnime(),
      api.genres(),
      api.topAiring(1),
      api.mostPopular(1),
      api.mostFavorite(1),
      api.completed(1),
    ]);

    // Extract values with fallbacks for rejected promises
    const listData =
      results[0].status === "fulfilled"
        ? results[0].value
        : { page: 1, pagination: [], results: [] };
    const topAnimeData =
      results[1].status === "fulfilled"
        ? results[1].value
        : { top_today: [], top_week: [], top_month: [] };
    const genresResponse =
      results[2].status === "fulfilled" ? results[2].value : { genres: [] };
    const topAiringData =
      results[3].status === "fulfilled" ? results[3].value : { results: [] };
    const mostPopularData =
      results[4].status === "fulfilled" ? results[4].value : { results: [] };
    const mostFavoriteData =
      results[5].status === "fulfilled" ? results[5].value : { results: [] };
    const completedData =
      results[6].status === "fulfilled" ? results[6].value : { results: [] };

    return {
      listData: mapAnimeListResults(listData),
      topAnimeData,
      genresData: genresResponse.genres || [],
      topAnimeCategoriesData: {
        topAiring: (topAiringData.results || []).slice(0, 5),
        mostPopular: (mostPopularData.results || []).slice(0, 5),
        mostFavorite: (mostFavoriteData.results || []).slice(0, 5),
        completed: (completedData.results || []).slice(0, 5),
      },
    };
  } catch (error) {
    console.error("Error fetching recently added data:", error);
    return {
      listData: { page: 1, pagination: [], results: [] },
      topAnimeData: { top_today: [], top_week: [], top_month: [] },
      genresData: [],
      topAnimeCategoriesData: {
        topAiring: [],
        mostPopular: [],
        mostFavorite: [],
        completed: [],
      },
    };
  }
}

export default async function RecentlyAddedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const { listData, topAnimeData, genresData, topAnimeCategoriesData } =
    await getRecentlyAddedData(page);

  return (
    <AnimeListTemplate
      title="Recently Added Anime"
      data={listData}
      topAnimeData={topAnimeData}
      topAnimeCategoriesData={topAnimeCategoriesData}
      genresData={genresData}
      basePath="/recently-added"
    />
  );
}
