import { AnimeListTemplate } from "@/components";
import { mapAnimeListResults } from "@/models/mappers";
import { api } from "@/lib/api";

async function getOnaData(page: number = 1) {
  try {
    const [listData, topAnimeData] = await Promise.all([
      api.ona(page),
      api.topAnime()
    ]);

    return {
      listData: mapAnimeListResults(listData),
      topAnimeData
    };
  } catch (error) {
    console.error('Error fetching ONA data:', error);
    return {
      listData: { page: 1, pagination: [], results: [] },
      topAnimeData: { top_today: [], top_week: [], top_month: [] }
    };
  }
}

export default async function OnaPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const { listData, topAnimeData } = await getOnaData(page);

  return (
    <AnimeListTemplate
      title="ONA Anime"
      data={listData}
      topAnimeData={topAnimeData}
      basePath="/ona"
    />
  );
}