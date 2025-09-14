import { AnimeListTemplate } from "@/components";
import { mapAnimeListResults } from "@/models/mappers";
import { api } from "@/lib/api";

async function getTopUpcomingData(page: number = 1) {
  try {
    const [listData, topAnimeData] = await Promise.all([
      api.topUpcoming(),
      api.topAnime()
    ]);

    return {
      listData: mapAnimeListResults(listData),
      topAnimeData
    };
  } catch (error) {
    console.error('Error fetching top upcoming data:', error);
    return {
      listData: { page: 1, pagination: [], results: [] },
      topAnimeData: { top_today: [], top_week: [], top_month: [] }
    };
  }
}

export default async function TopUpcomingPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const { listData, topAnimeData } = await getTopUpcomingData(page);

  return (
    <AnimeListTemplate
      title="Top Upcoming Anime"
      data={listData}
      topAnimeData={topAnimeData}
      basePath="/top-upcoming"
    />
  );
}