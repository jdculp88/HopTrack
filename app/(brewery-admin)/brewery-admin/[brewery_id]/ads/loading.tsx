import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function AdsLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
  );
}
