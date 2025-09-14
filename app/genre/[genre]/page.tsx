import { AnimeListTemplate } from "@/components";
import { mapAnimeListResults } from "@/models/mappers";
import { api } from "@/lib/api";

async function getGenreData(genre: string, page: number = 1) {
  try {
    const [listData, topAnimeData] = await Promise.all([
      api.genreAnime(genre, page),
      api.topAnime()
    ]);

    return {
      listData: mapAnimeListResults(listData),
      topAnimeData
    };
  } catch (error) {
    console.error('Error fetching genre data:', error);
    return {
      listData: { page: 1, pagination: [], results: [] },
      topAnimeData: { top_today: [], top_week: [], top_month: [] }
    };
  }
}

export default async function GenrePage({
  params,
  searchParams,
}: {
  params: { genre: string };
  searchParams: { page?: string };
}) {
  const genre = decodeURIComponent(params.genre);
  const page = parseInt(searchParams.page || '1', 10);
  const { listData, topAnimeData } = await getGenreData(genre, page);

  // Capitalize first letter of each word for display
  const displayGenre = genre
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <AnimeListTemplate
      title={`${displayGenre} Anime`}
      data={listData}
      topAnimeData={topAnimeData}
      basePath={`/genre/${params.genre}`}
    />
  );
}