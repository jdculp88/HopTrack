import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-4 w-24" />
      {/* Stats header */}
      <Skeleton className="h-36 rounded-3xl" />
      {/* Search + filters */}
      <Skeleton className="h-10 rounded-xl" />
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-lg" />
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
