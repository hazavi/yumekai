import { AnimeListTemplate } from "@/components";
import { mapAnimeListResults } from "@/models/mappers";
import { api } from "@/lib/api";

async function getSpecialData(page: number = 1) {
  try {
    const [listData, topAnimeData] = await Promise.all([
      api.special(page),
      api.topAnime()
    ]);

    return {
      listData: mapAnimeListResults(listData),
      topAnimeData
    };
  } catch (error) {
    console.error('Error fetching special data:', error);
    return {
      listData: { page: 1, pagination: [], results: [] },
      topAnimeData: { top_today: [], top_week: [], top_month: [] }
    };
  }
}

export default async function SpecialPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const { listData, topAnimeData } = await getSpecialData(page);

  return (
    <AnimeListTemplate
      title="Special Anime"
      data={listData}
      topAnimeData={topAnimeData}
      basePath="/special"
    />
  );
}