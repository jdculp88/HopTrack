import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrandTeamLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-6 h-6 rounded" />
        <Skeleton className="w-40 h-7 rounded" />
        <Skeleton className="w-8 h-6 rounded-full" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {[80, 70, 110, 120].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Member rows */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--surface-2)" }}>
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-32 h-4 rounded" />
            <Skeleton className="w-24 h-3 rounded" />
          </div>
          <Skeleton className="w-28 h-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
