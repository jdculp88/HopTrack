import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrandTapListLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header skeleton */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6 flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-7 w-56 rounded-lg mb-2" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8 space-y-5">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-3.5 border text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <Skeleton className="h-8 w-12 rounded-lg mx-auto mb-1" />
              <Skeleton className="h-3 w-20 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-full" />
            ))}
          </div>
        </div>

        {/* Beer rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-4 flex items-center gap-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-40 rounded-lg mb-1" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="w-3 h-3 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-4 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
