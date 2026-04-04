import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function PunchLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-md mx-auto pt-16 lg:pt-8">
      {/* Header */}
      <div className="mb-8 space-y-2 text-center">
        <Skeleton className="h-10 w-10 rounded-xl mx-auto mb-3" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Code input */}
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
