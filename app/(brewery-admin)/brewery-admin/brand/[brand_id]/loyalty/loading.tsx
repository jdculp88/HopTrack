import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrandLoyaltyLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Program card */}
      <section className="mb-10">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="p-5 rounded-2xl border space-y-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, j) => (
              <Skeleton key={j} className="w-5 h-5 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Top customers */}
      <section>
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
