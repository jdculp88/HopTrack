import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function PintRewindLoading() {
  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
