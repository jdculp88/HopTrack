import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function EventsLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto pt-16 lg:pt-8 space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-64" />
      <div className="pt-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
