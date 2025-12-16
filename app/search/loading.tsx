import {
  SearchResultsSkeleton,
  PaginationSkeleton,
} from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Search bar skeleton */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />
        </div>

        <SearchResultsSkeleton />
        <PaginationSkeleton />
      </div>
    </div>
  );
}
