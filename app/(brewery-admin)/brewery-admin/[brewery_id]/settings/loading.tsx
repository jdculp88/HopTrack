import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BrewerySettingsLoading() {
  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <Skeleton className="h-7 w-36" />
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <Skeleton className="h-10 w-28 rounded-xl mt-2" />
      </div>
    </div>
  );
}
