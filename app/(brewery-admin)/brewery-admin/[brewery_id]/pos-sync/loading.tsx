import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function PosSyncLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-6" />

      {/* Filter pills skeleton */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>

      {/* Log rows skeleton */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
