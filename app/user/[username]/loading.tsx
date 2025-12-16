import { UserProfileSkeleton } from "@/components/Skeletons";

export default function Loading() {
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <UserProfileSkeleton />
      </div>
    </div>
  );
}
