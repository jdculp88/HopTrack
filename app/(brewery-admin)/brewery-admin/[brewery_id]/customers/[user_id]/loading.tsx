import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function CustomerProfileLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto pt-16 lg:pt-8 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
