export default function AnimeDetailLoading() {
  return (
    <div className="relative min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-4 w-12 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-4 bg-white/5 rounded" />
          <div className="h-4 w-8 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-4 bg-white/5 rounded" />
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {/* Poster skeleton */}
              <div className="flex-shrink-0">
                <div className="w-60 h-85 bg-white/10 rounded animate-pulse" />
                <div className="w-60 h-10 mt-3 bg-white/10 rounded-full animate-pulse" />
              </div>

              {/* Info skeleton */}
              <div className="flex-1 space-y-4">
                {/* Title */}
                <div className="h-10 w-3/4 bg-white/10 rounded animate-pulse" />

                {/* Tags - quality, sub count, dub count, type, duration */}
                <div className="flex gap-2 flex-wrap">
                  <div className="h-6 w-12 bg-white/10 rounded-full animate-pulse" />
                  <div className="h-6 w-14 bg-white/10 rounded-full animate-pulse" />
                  <div className="h-6 w-14 bg-white/10 rounded-full animate-pulse" />
                  <div className="h-6 w-10 bg-white/10 rounded-full animate-pulse" />
                  <div className="h-6 w-12 bg-white/10 rounded-full animate-pulse" />
                </div>

                {/* Action Buttons - Watch Now & Add to List */}
                <div className="flex flex-wrap gap-3">
                  <div className="h-11 w-32 bg-white/10 rounded-full animate-pulse" />
                  <div className="h-11 w-32 bg-white/10 rounded-full animate-pulse" />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-4">
            <div className="glass p-6 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex gap-2">
                  <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 flex-1 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
              {/* Genres */}
              <div className="pt-2">
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse mb-2" />
                <div className="flex flex-wrap gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-16 bg-white/10 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Skeleton */}
        <div className="mt-12 grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8">
            <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[2/3] bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Top Anime Sidebar Skeleton */}
          <div className="xl:col-span-4">
            <div className="glass p-4">
              {/* Category tabs */}
              <div className="flex gap-2 mb-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-20 bg-white/10 rounded animate-pulse"
                  />
                ))}
              </div>
              {/* Top anime list */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 py-3 border-b border-white/5"
                >
                  <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse flex-shrink-0" />
                  <div className="w-12 h-16 bg-white/10 rounded animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
