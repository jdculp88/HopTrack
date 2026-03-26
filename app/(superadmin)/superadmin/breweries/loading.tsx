import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BreweriesLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-12 w-full max-w-sm rounded-xl" />
      <div className="space-y-1">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
