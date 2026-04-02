import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrandDashboardLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header skeleton */}
      <div className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6 flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-7 w-48 rounded-lg mb-2" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8 space-y-6">
        {/* Today's Snapshot skeleton */}
        <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Skeleton className="h-5 w-56 rounded-lg mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 rounded mb-2" />
                <Skeleton className="h-9 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* KPI Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 border text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <Skeleton className="h-4 w-4 rounded mx-auto mb-2" />
              <Skeleton className="h-8 w-12 rounded-lg mx-auto mb-1" />
              <Skeleton className="h-3 w-16 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Two-column skeleton */}
        <div className="grid lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <Skeleton className="h-5 w-40 rounded-lg mb-3" />
              <Skeleton className="h-12 w-20 rounded-lg mb-2" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          ))}
        </div>

        {/* Location breakdown skeleton */}
        <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Skeleton className="h-5 w-44 rounded-lg mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <Skeleton className="h-4 w-5 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-36 rounded-lg mb-1" />
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
