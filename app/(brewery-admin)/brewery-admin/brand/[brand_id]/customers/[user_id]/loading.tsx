import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrandCustomerProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pt-16 lg:pt-8 space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-32 rounded-lg" />

      {/* Header card */}
      <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-start gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48 rounded-xl" />
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-2 w-full mt-4 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Location breakdown */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Skeleton className="h-6 w-40 mb-4 rounded-lg" />
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Taste + Beers */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Skeleton className="h-6 w-36 mb-4 rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 mb-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-3 w-48 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
