import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function HopRouteNewLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-1 flex-1 rounded-full" />)}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-40 rounded" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
