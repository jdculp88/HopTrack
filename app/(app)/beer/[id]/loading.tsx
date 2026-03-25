import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BeerLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-1.5">
              <Skeleton className="h-5 w-12 mx-auto" />
              <Skeleton className="h-3 w-10 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      <Skeleton className="h-5 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}
