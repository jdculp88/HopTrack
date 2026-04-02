import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrandSettingsLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto pt-16 lg:pt-8">
      <Skeleton className="h-10 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
