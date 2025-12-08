import { AnimeGrid } from "@/components/AnimeGrid";
import { SectionHeader } from "@/components/SectionHeader";
import { SearchPagination } from "@/components/SearchPagination";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const page = parseInt(params.page || "1", 10);

  if (!query) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Search Anime</h1>
          <p className="text-white/60">Enter a search term to find anime</p>
        </div>
      </div>
    );
  }

  // Fetch search results through internal API route
  let searchData;
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/search?keyword=${encodeURIComponent(query)}&page=${page}`,
      {
        next: { revalidate: 60 },
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const rawData = await response.json();

    // Normalize the response
    searchData = {
      results: rawData.results || [],
      pagination: rawData.pagination || [],
      page: rawData.page || page,
    };
  } catch (error) {
    console.error("Search fetch error:", error);
    searchData = {
      results: [],
      pagination: [],
      page: page,
    };
  }

  // Handle empty results
  if (!searchData.results || searchData.results.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            Search Results for "{query}"
          </h1>
          <div className="text-center mt-12">
            <p className="text-white/60 text-lg">
              No results found for "{query}"
            </p>
            <p className="text-white/40 mt-2">Try a different search term</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-8 py-10">
        <SectionHeader className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Search Results for "{query}"
            </h1>
            <p className="text-white/60 text-sm">
              Found {searchData.results.length} result
              {searchData.results.length !== 1 ? "s" : ""}
            </p>
          </div>
        </SectionHeader>

        <AnimeGrid
          items={searchData.results}
          badgeType="latest"
          className="mb-12 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6"
        />

        {searchData.pagination && searchData.pagination.length > 1 && (
          <SearchPagination
            pagination={searchData.pagination}
            currentPage={page}
            searchQuery={query}
          />
        )}
      </div>
    </div>
  );
}
