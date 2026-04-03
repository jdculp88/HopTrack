import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function CommandCenterLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-9 w-56 mb-1" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Platform Pulse — 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 border space-y-2"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <Skeleton className="h-3 w-16 mx-auto" />
            <Skeleton className="h-7 w-12 mx-auto" />
          </div>
        ))}
      </div>

      {/* Revenue + Engagement — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5 border space-y-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-24 mx-auto" />
          <Skeleton className="h-40 w-40 rounded-full mx-auto" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full rounded-full" />
            ))}
          </div>
        </div>
        <div
          className="rounded-2xl p-5 border space-y-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Growth Trends — 3 charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <Skeleton className="h-4 w-28 mb-3" />
            <Skeleton className="h-[120px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Geo + Health — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5 border space-y-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Skeleton className="h-5 w-44" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full rounded-full" />
          ))}
        </div>
        <div
          className="rounded-2xl p-5 border space-y-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div
        className="rounded-2xl p-5 border space-y-2"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <Skeleton className="h-5 w-36 mb-3" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
