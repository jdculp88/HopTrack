import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrandPageLoading() {
  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg)" }}>
      {/* Hero skeleton */}
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl" />
          <div className="text-center sm:text-left space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="max-w-3xl mx-auto px-4">
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)" }}>
              <Skeleton className="h-32 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
