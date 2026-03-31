import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BarbackLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border p-5 space-y-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Pending review table */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-36" />
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="px-5 py-4 flex items-center gap-4"
              style={{ borderTop: i > 0 ? "1px solid var(--border)" : undefined }}
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-12 rounded-full" />
              <div className="flex-1" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
