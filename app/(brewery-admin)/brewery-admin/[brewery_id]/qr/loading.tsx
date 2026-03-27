import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function Loading() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pt-16 lg:pt-8">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-4 w-80 mb-8" />
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    </div>
  );
}
