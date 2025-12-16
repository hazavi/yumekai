import { Metadata } from "next";
import { AnimeListTemplate } from "@/components";
import { mapAnimeListResults } from "@/utils/mappers";
import { api } from "@/services/api";

export const metadata: Metadata = {
  title: "Top Upcoming",
  description: "Browse upcoming anime releases",
};

async function getTopUpcomingData() {
  try {
    const [
      listData,
      topAnimeData,
      genresResponse,
      topAiringData,
      mostPopularData,
      mostFavoriteData,
      completedData,
    ] = await Promise.all([
      api.topUpcoming(),
      api.topAnime(),
      api.genres(),
      api.topAiring(1),
      api.mostPopular(1),
      api.mostFavorite(1),
      api.completed(1),
    ]);

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
    console.error("Error fetching top upcoming data:", error);
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

export default async function TopUpcomingPage() {
  const { listData, topAnimeData, genresData, topAnimeCategoriesData } =
    await getTopUpcomingData();

  return (
    <AnimeListTemplate
      title="Top Upcoming Anime"
      data={listData}
      topAnimeData={topAnimeData}
      topAnimeCategoriesData={topAnimeCategoriesData}
      genresData={genresData}
      basePath="/top-upcoming"
      badgeType="upcoming"
    />
  );
}
