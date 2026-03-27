import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function Loading() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto pt-16 lg:pt-8">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-4 w-40 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
