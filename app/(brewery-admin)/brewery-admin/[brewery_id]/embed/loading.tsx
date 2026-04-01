import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function EmbedLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto pt-16 lg:pt-8 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <div className="pt-4 space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}
