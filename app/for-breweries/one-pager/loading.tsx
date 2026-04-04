import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function OnePagerLoading() {
  return (
    <div className="max-w-2xl mx-auto px-8 py-12">
      <Skeleton className="h-9 w-48 mx-auto mb-10" />
      <div className="text-center space-y-3 mb-10">
        <Skeleton className="h-3 w-24 mx-auto" />
        <Skeleton className="h-12 w-80 mx-auto" />
        <Skeleton className="h-16 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-3 gap-5 mb-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-28 rounded-2xl mb-10" />
    </div>
  );
}
