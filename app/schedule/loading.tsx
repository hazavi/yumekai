import { ScheduleSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 w-48 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-5 w-64 bg-white/10 rounded animate-pulse" />
        </div>

        <ScheduleSkeleton />
      </div>
    </div>
  );
}
