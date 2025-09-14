import { AnimeListTemplate } from "@/components";
import { mapAnimeListResults } from "@/models/mappers";
import { api } from "@/lib/api";

async function getTvData(page: number = 1) {
  try {
    const [listData, topAnimeData] = await Promise.all([
      api.tv(page),
      api.topAnime()
    ]);

    return {
      listData: mapAnimeListResults(listData),
      topAnimeData
    };
  } catch (error) {
    console.error('Error fetching TV data:', error);
    return {
      listData: { page: 1, pagination: [], results: [] },
      topAnimeData: { top_today: [], top_week: [], top_month: [] }
    };
  }
}

export default async function TvPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const { listData, topAnimeData } = await getTvData(page);

  return (
    <AnimeListTemplate
      title="TV Series Anime"
      data={listData}
      topAnimeData={topAnimeData}
      basePath="/tv"
    />
  );
}