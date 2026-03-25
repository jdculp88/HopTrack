import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function AchievementsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-col items-center gap-3">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2.5 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
