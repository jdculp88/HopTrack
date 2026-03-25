import { SkeletonProfile, SkeletonCheckinCard, Skeleton } from "@/components/ui/SkeletonLoader";

export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <SkeletonProfile />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-2">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Recent check-ins */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCheckinCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
