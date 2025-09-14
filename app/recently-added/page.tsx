import { AnimeListTemplate } from "@/components";
import { mapAnimeListResults } from "@/models/mappers";
import { api } from "@/lib/api";

async function getRecentlyAddedData(page: number = 1) {
  try {
    const [listData, topAnimeData] = await Promise.all([
      api.recentlyAdded(page),
      api.topAnime()
    ]);

    return {
      listData: mapAnimeListResults(listData),
      topAnimeData
    };
  } catch (error) {
    console.error('Error fetching recently added data:', error);
    return {
      listData: { page: 1, pagination: [], results: [] },
      topAnimeData: { top_today: [], top_week: [], top_month: [] }
    };
  }
}

export default async function RecentlyAddedPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const { listData, topAnimeData } = await getRecentlyAddedData(page);

  return (
    <AnimeListTemplate
      title="Recently Added Anime"
      data={listData}
      topAnimeData={topAnimeData}
      basePath="/recently-added"
    />
  );
}