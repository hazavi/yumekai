import { Metadata } from "next";
import { AnimeListTemplate } from "@/components";
import { mapAnimeListResults } from "@/utils/mappers";
import { api } from "@/services/api";

type Props = {
  params: Promise<{ genre: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const genre = decodeURIComponent(resolvedParams.genre)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return {
    title: `${genre} Anime`,
    description: `Browse ${genre} anime on Yumekai`,
  };
}

async function getGenreData(genre: string, page: number = 1) {
  try {
    const results = await Promise.allSettled([
      api.genreAnime(genre, page),
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
    console.error("Error fetching genre data:", error);
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

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: Promise<{ genre: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const genre = decodeURIComponent(resolvedParams.genre);
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const { listData, topAnimeData, genresData, topAnimeCategoriesData } =
    await getGenreData(genre, page);

  // Capitalize first letter of each word for display
  const displayGenre = genre
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <AnimeListTemplate
      title={`${displayGenre} Anime`}
      data={listData}
      topAnimeData={topAnimeData}
      topAnimeCategoriesData={topAnimeCategoriesData}
      genresData={genresData}
      basePath={`/genre/${resolvedParams.genre}`}
    />
  );
}
