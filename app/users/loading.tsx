import { AnimeGridSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-12 w-full max-w-md bg-white/10 rounded-lg animate-pulse" />
        </div>

        {/* User cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
