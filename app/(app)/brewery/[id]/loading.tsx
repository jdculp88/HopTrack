import { Skeleton, SkeletonCard } from "@/components/ui/SkeletonLoader";

export default function BreweryLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <Skeleton className="h-72 sm:h-96 w-full rounded-none" />

      <div className="px-4 sm:px-6 py-6 space-y-8">
        {/* Info row */}
        <div className="flex gap-4">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-12" />
            </div>
          ))}
        </div>

        {/* Beer menu */}
        <div>
          <Skeleton className="h-7 w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
