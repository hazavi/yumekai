export default function Loading() {
  return (
    <div className="min-h-screen pt-16">
      {/* Video player skeleton */}
      <div className="w-full aspect-video bg-white/5 animate-pulse" />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main content - video info */}
          <div className="lg:col-span-8 space-y-4">
            {/* Title */}
            <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-white/10 rounded animate-pulse" />

            {/* Room controls */}
            <div className="flex gap-3 flex-wrap">
              <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-24 bg-white/10 rounded animate-pulse" />
            </div>
          </div>

          {/* Chat sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white/5 rounded-lg p-4 h-96 flex flex-col">
              {/* Chat header */}
              <div className="h-6 w-24 bg-white/10 rounded animate-pulse mb-4" />

              {/* Chat messages skeleton */}
              <div className="flex-1 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat input */}
              <div className="mt-4 h-10 w-full bg-white/10 rounded animate-pulse" />
            </div>

            {/* Participants */}
            <div className="mt-4 p-4 bg-white/5 rounded-lg space-y-3">
              <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse" />
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
