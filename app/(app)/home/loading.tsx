import { SkeletonCheckinCard } from "@/components/ui/SkeletonLoader";
import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function HomeLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Tab bar skeleton */}
      <div className="flex">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-1 py-3 flex justify-center">
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>

      {/* Your Round header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>

      {/* Live Now strip skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border flex-shrink-0 w-[140px]"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Feed cards skeleton */}
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCheckinCard key={i} />
      ))}
    </div>
  );
}
