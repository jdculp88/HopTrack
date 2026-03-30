import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function BeerListsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border px-4 py-3 flex items-center gap-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Skeleton className="w-4 h-4 rounded" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      ))}
    </div>
  );
}
