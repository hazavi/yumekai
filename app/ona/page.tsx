import { AnimeListTemplate } from "@/components";
import { mapAnimeListResults } from "@/models/mappers";
import { api } from "@/lib/api";

async function getOnaData(page: number = 1) {
  try {
    const [listData, topAnimeData, genresResponse, topAiringData, mostPopularData, mostFavoriteData, completedData] = await Promise.all([
      api.ona(page),
      api.topAnime(),
      api.genres(),
      api.topAiring(1),
      api.mostPopular(1),
      api.mostFavorite(1),
      api.completed(1)
    ]);

    return {
      listData: mapAnimeListResults(listData),
      topAnimeData,
      genresData: genresResponse.genres || [],
      topAnimeCategoriesData: {
        topAiring: (topAiringData.results || []).slice(0, 5),
        mostPopular: (mostPopularData.results || []).slice(0, 5),
        mostFavorite: (mostFavoriteData.results || []).slice(0, 5),
        completed: (completedData.results || []).slice(0, 5)
      }
    };
  } catch (error) {
    console.error('Error fetching ONA data:', error);
    return {
      listData: { page: 1, pagination: [], results: [] },
      topAnimeData: { top_today: [], top_week: [], top_month: [] },
      genresData: [],
      topAnimeCategoriesData: {
        topAiring: [],
        mostPopular: [],
        mostFavorite: [],
        completed: []
      }
    };
  }
}

export default async function OnaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const { listData, topAnimeData, genresData, topAnimeCategoriesData } = await getOnaData(page);

  return (
    <AnimeListTemplate
      title="ONA Anime"
      data={listData}
      topAnimeData={topAnimeData}
      topAnimeCategoriesData={topAnimeCategoriesData}
      genresData={genresData}
      basePath="/ona"
    />
  );
}