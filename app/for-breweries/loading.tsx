import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function ForBreweriesLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-6">
        <Skeleton className="h-12 w-72 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-20" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
