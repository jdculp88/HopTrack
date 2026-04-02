import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrandCustomersLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-16 lg:pt-8 space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-4 w-80 mt-2 rounded-lg" />
      </div>

      {/* Insight cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-3 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-12 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
