import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function ResourcesLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto pt-16 lg:pt-8">
      <Skeleton className="h-9 w-40 mb-2 rounded-xl" />
      <Skeleton className="h-4 w-72 mb-8 rounded-xl" />
      <Skeleton className="h-4 w-32 mb-4 rounded-xl" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full mb-3 rounded-2xl" />
      ))}
    </div>
  );
}
