import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function ClaimLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-10 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}
