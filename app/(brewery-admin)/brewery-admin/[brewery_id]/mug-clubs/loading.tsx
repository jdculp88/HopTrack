import { Skeleton } from "@/components/ui/SkeletonLoader";

export default function MugClubsLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto pt-16 lg:pt-8">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border space-y-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
