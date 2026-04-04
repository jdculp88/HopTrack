import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function LeaderboardsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* PageHeader placeholder */}
      <div className="mb-8 space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-9 w-52 rounded-xl" />
        <Skeleton className="h-4 w-44 rounded mt-1" />
      </div>

      {/* Category pills placeholder */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={`cat-${i}`} className="h-8 w-24 rounded-xl" />
        ))}
      </div>

      {/* Scope pills placeholder */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={`scope-${i}`} className="h-8 w-20 rounded-xl" />
        ))}
      </div>

      {/* Leaderboard rows placeholder */}
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-[var(--border)]">
            <Skeleton className="w-8 h-6 rounded" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <Skeleton className="h-5 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
