import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BreweryDashboardLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto pt-16 lg:pt-8">

      {/* Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Today's Snapshot banner */}
      <div
        className="rounded-2xl border p-4 mb-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Skeleton className="h-3 w-12 mb-3" />
        <div className="flex gap-6">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* KPI Cards — 4 cards: Today Visits / This Week / Active Now / Followers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-3.5 w-3.5 rounded" />
            </div>
            <div className="flex items-end justify-between mb-2">
              <Skeleton className="h-8 w-12" />
              {i === 0 && <Skeleton className="h-7 w-16" />}
            </div>
            <Skeleton className="h-2.5 w-24" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left column: Activity + Top Beers + Recent Visits */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{ background: i === 0 ? "var(--surface)" : "transparent" }}>
                  <Skeleton className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                  <Skeleton className="h-2.5 w-12 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Top Beers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <Skeleton className="h-7 w-6 flex-shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-2.5 w-1/3" />
                    <Skeleton className="h-1 w-full rounded-full" />
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1.5">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-2.5 w-10" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Visits */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-2.5 w-48" />
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <Skeleton className="h-2.5 w-8" />
                    <Skeleton className="h-2.5 w-14" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Quick Actions grid (2×4) */}
          <div>
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-3"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <Skeleton className="h-4 w-4 mb-1.5 rounded" />
                  <Skeleton className="h-3 w-14 mb-1" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* All-Time Stats */}
          <div className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <Skeleton className="h-5 w-28 mb-3" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Loyalty */}
          <div className="rounded-2xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-3.5 rounded" />
            </div>
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
