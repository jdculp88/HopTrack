import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BreweryDetailLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-40" />

      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Account Overview + Tap List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border p-5 space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border p-5 space-y-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-5 text-center space-y-2" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <Skeleton className="h-8 w-16 mx-auto" />
            <Skeleton className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Team */}
      <div className="rounded-2xl border p-5 space-y-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border p-5 space-y-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
