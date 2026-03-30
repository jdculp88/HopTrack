import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BeerListDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <Skeleton className="h-9 w-56" />
      {/* Description */}
      <Skeleton className="h-4 w-72" />
      {/* Beer rows */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0"
          >
            <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}
