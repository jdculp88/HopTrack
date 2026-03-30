import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function HopRouteLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-8 w-56 rounded-xl" />
      <Skeleton className="h-4 w-40 rounded" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-5 rounded-2xl border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
