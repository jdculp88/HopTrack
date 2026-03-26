import { Skeleton, SkeletonText } from "@/components/ui/SkeletonLoader";

export default function PrivacyLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-4 w-36" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <SkeletonText lines={4} />
        </div>
      ))}
    </div>
  );
}
