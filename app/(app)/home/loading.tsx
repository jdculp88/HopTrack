import { SkeletonCheckinCard } from "@/components/ui/SkeletonLoader";
import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function HomeLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome card skeleton */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-3 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-1.5">
              <Skeleton className="h-6 w-10 mx-auto" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Feed header */}
      <Skeleton className="h-5 w-28" />

      {/* Checkin cards */}
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCheckinCard key={i} />
      ))}
    </div>
  );
}
