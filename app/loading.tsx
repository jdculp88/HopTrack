import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function RootLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-20 space-y-6 text-center">
        <Skeleton className="h-12 w-80 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
        <div className="flex justify-center gap-4 pt-4">
          <Skeleton className="h-12 w-40 rounded-xl" />
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>
      </div>
      {/* Section skeletons */}
      <div className="max-w-6xl mx-auto px-4 space-y-16 pb-20">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-40 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
