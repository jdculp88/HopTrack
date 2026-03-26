import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BreweryAdminIndexLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
      <Skeleton className="h-12 w-12 mx-auto rounded-full" />
      <Skeleton className="h-6 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>
  );
}
