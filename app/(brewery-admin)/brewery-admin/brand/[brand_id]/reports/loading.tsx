import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrandReportsLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header skeleton */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6 flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-7 w-52 rounded-lg mb-2" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8 space-y-6">
        {/* Range pills + export skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-xl" />
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-xl" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        </div>

        {/* Brand totals skeleton */}
        <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Skeleton className="h-5 w-48 rounded-lg mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-14 rounded-lg mx-auto mb-1" />
                <Skeleton className="h-3 w-16 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Charts skeleton */}
        <div className="grid lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <Skeleton className="h-4 w-28 rounded-lg mb-3" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-5 flex-1 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Leaderboard skeleton */}
        <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Skeleton className="h-5 w-44 rounded-lg mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <Skeleton className="h-4 w-6 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 rounded-lg mb-1" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
