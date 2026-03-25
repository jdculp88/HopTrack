import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function AnalyticsLoading() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Skeleton className="h-7 w-32" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 flex-1 rounded-full" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
