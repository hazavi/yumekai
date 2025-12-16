export default function Loading() {
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8 text-center">
          <div className="h-10 w-64 bg-white/10 rounded animate-pulse mx-auto mb-4" />
          <div className="h-5 w-96 bg-white/10 rounded animate-pulse mx-auto" />
        </div>

        {/* Create/Join room cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Create room card */}
          <div className="p-6 bg-white/5 rounded-xl space-y-4">
            <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />
            <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />
          </div>

          {/* Join room card */}
          <div className="p-6 bg-white/5 rounded-xl space-y-4">
            <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />
            <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
