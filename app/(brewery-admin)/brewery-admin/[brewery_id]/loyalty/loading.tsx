import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function LoyaltyLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stamp Programs section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 1 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: 10 }).map((_, j) => (
                  <Skeleton key={j} className="w-5 h-5 rounded-full" />
                ))}
              </div>
              <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* Promotions section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-10 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-5 rounded-full" />
                <Skeleton className="w-7 h-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
